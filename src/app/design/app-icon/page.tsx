// Source for the favicon set and src/app/apple-icon.png. Internal design page.
export default function AppIconFrame() {
  return (
    <div className="flex gap-10 p-0">
      {/* 512 × 512 square: favicon + apple icon (iOS rounds the corners itself) */}
      <div id="square" className="flex h-[512px] w-[512px] items-center justify-center bg-forest">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/moneta-icon-turquoise.svg" alt="" className="h-auto w-[300px]" />
      </div>
    </div>
  );
}
