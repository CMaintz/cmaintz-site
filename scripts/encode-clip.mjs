// Turns a screen recording into a small looping web clip + poster for a
// project page. Usage:
//   node scripts/encode-clip.mjs <input> <name> [startSeconds] [endSeconds]
// Writes public/media/<name>.mp4, .webm and .jpg (poster = last frame).
// Then set `video: /media/<name>` in the project's frontmatter.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import ffmpeg from 'ffmpeg-static';

const OUT = 'public/media';
const WIDTH = 960;

function trimArgs(start, end) {
  const args = [];
  if (start) args.push('-ss', start);
  if (end) args.push('-to', end);
  return args;
}

const H264 = ['-c:v', 'libx264', '-crf', '28', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
const VP9 = ['-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0'];

/** Encodes one output file; `codec` is the codec-specific ffmpeg args. */
function encode(input, trim, codec, output) {
  const common = ['-y', '-loglevel', 'error', ...trim, '-i', input, '-vf', `fps=24,scale=${WIDTH}:-2`, '-an'];
  execFileSync(ffmpeg, [...common, ...codec, output]);
}

function poster(name) {
  execFileSync(ffmpeg, [
    '-y',
    '-loglevel',
    'error',
    '-sseof',
    '-0.5',
    '-i',
    `${OUT}/${name}.mp4`,
    '-frames:v',
    '1',
    '-q:v',
    '4',
    `${OUT}/${name}.jpg`,
  ]);
}

function main() {
  const [input, name, start, end] = process.argv.slice(2);
  if (!input || !name) throw new Error('usage: node scripts/encode-clip.mjs <input> <name> [start] [end]');
  mkdirSync(OUT, { recursive: true });
  const trim = trimArgs(start, end);
  encode(input, trim, H264, `${OUT}/${name}.mp4`);
  encode(input, trim, VP9, `${OUT}/${name}.webm`);
  poster(name);
  console.log(`wrote ${OUT}/${name}.{mp4,webm,jpg} - set "video: /media/${name}" in the project frontmatter`);
}

main();
