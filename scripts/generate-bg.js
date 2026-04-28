import sharp from 'sharp';
import path from 'path';

const src = path.resolve('src/images/fondo2.jpg');
const outDir = path.resolve('src/images');
const sizes = [1280, 1920, 3840];

async function run(){
  for(const size of sizes){
    const nameBase = `bg-${size}`;
    console.log('Generating', nameBase);
    await sharp(src).resize(size).avif({ quality: 60 }).toFile(path.join(outDir, `${nameBase}.avif`));
    await sharp(src).resize(size).webp({ quality: 80 }).toFile(path.join(outDir, `${nameBase}.webp`));
    await sharp(src).resize(size).jpeg({ quality: 80 }).toFile(path.join(outDir, `${nameBase}.jpg`));
  }
}

run().catch(e=>{ console.error(e); process.exit(1); });
