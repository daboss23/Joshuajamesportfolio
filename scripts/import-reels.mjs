#!/usr/bin/env node
import { createRequire } from "node:module";
/**
 * Pulls the portfolio reels out of Google Drive, transcodes them to
 * web-sized mp4s and grabs a cover frame for each.
 *
 *   node scripts/import-reels.mjs            # everything
 *   node scripts/import-reels.mjs cerebroflex spirituality
 *
 * Needs outbound access to drive.usercontent.google.com, so it will not run
 * in a session whose egress policy blocks Drive. Outputs land in
 * public/videos and public/posters; the large originals are deleted as soon
 * as each transcode succeeds so the working disk never holds all of them.
 */
import { execFileSync, execSync } from "node:child_process";
import { mkdirSync, existsSync, statSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Drive file ids for the ten selected reels, in portfolio order. */
const REELS = [
  { id: "cerebroflex", driveId: "1aukdeAF3Y6ppnunhICdtd2ksqi179Q-s", source: "Updated Cerebroflex Tok Video.mp4" },
  { id: "cosmic-clean-9000", driveId: "1jopum_f0cbbBadcZV9n6rw9R91nUiy-q", source: "Cosmic Clean 9000 Ad.mp4" },
  { id: "enclothed-cognition", driveId: "1cFY6VcYW3BJwunxZX24yHIUQLK4_LJQH", source: "Enclothed Cognition.mp4" },
  { id: "spirituality", driveId: "1Yeou9hWmIonxugJzRet3IzDznQaB6TBe", source: "Spirituality Vid.mp4" },
  { id: "project369", driveId: "1VfEQNMITdLQnBJn6hwXgwSKSfltVdxBy", source: "AProject369 Vid.mp4" },
  { id: "warrior-within", driveId: "1PsJQ1gf2vs4epdTLAY4KWGJGarjgCwzd", source: "Warrior Within!.mp4" },
  { id: "ivanna", driveId: "1cM3JPpeFIH2EaU42SvbqEtPE78EwHvw6", source: "New Ivanna Tok Content.mp4" },
  { id: "ww-tiktok", driveId: "1Z4k248fCjrxMqSt0Nqt16GmaL9yV1Vgg", source: "WW TiTok Content Video.mp4" },
  { id: "iwon-organics", driveId: "1tIhH_27V2rx_AwJ5UYZepq_l177gD2Te", source: "iwon Organics Viral Tiktok Video.mp4" },
  { id: "boss-warrior", driveId: "1Nd3RvC2GMwSko4M6k4CaIborqZTZUUmj", source: "a newe boss warrior vid.mp4" },
];

const RAW = "/tmp/reel-import";
const VIDEO_OUT = "public/videos";
const POSTER_OUT = "public/posters";

/** Long edge to target. Short-form is watched on phones; 1080p is plenty. */
const MAX_EDGE = 1920;
/** Constant-quality target. 23 is visually clean; raise for smaller files. */
const CRF = 23;

const ffmpeg = resolveBinary("ffmpeg");
const ffprobe = resolveBinary("ffprobe");

function resolveBinary(name) {
  try {
    return execSync(`command -v ${name}`, { encoding: "utf8" }).trim();
  } catch {}
  try {
    const mod = name === "ffmpeg" ? "ffmpeg-static" : "ffprobe-static";
    const resolved = createRequire(import.meta.url)(mod);
    return typeof resolved === "string" ? resolved : resolved.path;
  } catch {
    throw new Error(
      `${name} not found. Install it, or run: npm install --no-save ffmpeg-static ffprobe-static`,
    );
  }
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

function download(driveId, dest) {
  execFileSync(
    "curl",
    [
      "-sSL", "--fail", "--retry", "3", "--retry-delay", "2",
      "-o", dest,
      `https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=t`,
    ],
    { stdio: ["ignore", "inherit", "inherit"] },
  );
  // A denied or quota-limited download arrives as an HTML error page.
  const head = execFileSync("head", ["-c", "16", dest], { encoding: "latin1" });
  if (head.includes("<!DOCTYPE") || head.includes("<html")) {
    throw new Error("Drive returned an HTML page instead of the file (permissions or quota).");
  }
}

function probe(file) {
  const raw = execFileSync(
    ffprobe,
    [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height:format=duration",
      "-of", "json", file,
    ],
    { encoding: "utf8" },
  );
  const { streams, format } = JSON.parse(raw);
  return {
    width: streams[0].width,
    height: streams[0].height,
    duration: Number(format.duration),
  };
}

/** Cap the long edge while keeping the source aspect and even dimensions. */
function scaleFilter({ width, height }) {
  const longEdge = Math.max(width, height);
  if (longEdge <= MAX_EDGE) return "scale=trunc(iw/2)*2:trunc(ih/2)*2";
  return height >= width
    ? `scale=-2:${MAX_EDGE}`
    : `scale=${MAX_EDGE}:-2`;
}

function transcode(src, dest, meta) {
  execFileSync(
    ffmpeg,
    [
      "-y", "-loglevel", "error", "-i", src,
      "-vf", scaleFilter(meta),
      "-c:v", "libx264", "-profile:v", "high", "-preset", "slow",
      "-crf", String(CRF), "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "128k", "-ac", "2",
      // Puts the index up front so playback starts before the file finishes.
      "-movflags", "+faststart",
      dest,
    ],
    { stdio: ["ignore", "inherit", "inherit"] },
  );
}

/** Grab a frame a little way in, so we skip fades and black leader. */
function poster(src, dest, meta) {
  const at = Math.min(Math.max(meta.duration * 0.1, 0.5), 3);
  execFileSync(
    ffmpeg,
    [
      "-y", "-loglevel", "error", "-ss", at.toFixed(2), "-i", src,
      "-frames:v", "1", "-vf", scaleFilter(meta), "-q:v", "3", dest,
    ],
    { stdio: ["ignore", "inherit", "inherit"] },
  );
}

const only = process.argv.slice(2);
const queue = only.length ? REELS.filter((r) => only.includes(r.id)) : REELS;
if (!queue.length) throw new Error(`No reels matched: ${only.join(", ")}`);

for (const dir of [RAW, VIDEO_OUT, POSTER_OUT]) mkdirSync(dir, { recursive: true });

const manifest = [];
for (const [i, reel] of queue.entries()) {
  const label = `[${i + 1}/${queue.length}] ${reel.id}`;
  const raw = join(RAW, `${reel.id}.src.mp4`);
  const out = join(VIDEO_OUT, `${reel.id}.mp4`);
  const cover = join(POSTER_OUT, `${reel.id}.jpg`);

  try {
    if (!existsSync(raw)) {
      console.log(`${label} downloading ${reel.source}`);
      download(reel.driveId, raw);
    }
    const meta = probe(raw);
    const orientation = meta.height >= meta.width ? "vertical" : "landscape";
    console.log(
      `${label} ${meta.width}x${meta.height} ${orientation}, ` +
        `${meta.duration.toFixed(0)}s, ${mb(statSync(raw).size)} MB — transcoding`,
    );

    transcode(raw, out, meta);
    poster(raw, cover, meta);
    rmSync(raw, { force: true });

    const size = statSync(out).size;
    console.log(`${label} done → ${mb(size)} MB`);
    manifest.push({ ...reel, ...meta, orientation, bytes: size });
  } catch (err) {
    console.error(`${label} FAILED: ${err.message}`);
    manifest.push({ ...reel, error: err.message });
  }
}

writeFileSync("scripts/import-manifest.json", JSON.stringify(manifest, null, 2) + "\n");

const ok = manifest.filter((m) => !m.error);
const total = ok.reduce((sum, m) => sum + m.bytes, 0);
console.log(`\n${ok.length}/${queue.length} transcoded, ${mb(total)} MB total.`);
const landscape = ok.filter((m) => m.orientation === "landscape");
if (landscape.length) {
  console.log(
    `Not vertical (the 9:16 player will crop these): ${landscape.map((m) => m.id).join(", ")}`,
  );
}
