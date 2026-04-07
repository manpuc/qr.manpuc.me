import QRCode from 'qrcode';
import LZString from 'lz-string';

const GET = async ({ url }) => {
  const q = url.searchParams.get("q");
  let data = "https://qr.manpuc.me/";
  let fgColor = "#000000";
  let bgColor = "#ffffff";
  if (q) {
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(q);
      if (decompressed) {
        const parsed = JSON.parse(decompressed);
        data = parsed.d || data;
        fgColor = parsed.f || fgColor;
        bgColor = parsed.b || bgColor;
        if (parsed.t === 1) {
          bgColor = "#ffffff";
        }
      }
    } catch (e) {
      console.error("OG Image Generation failed to parse state", e);
    }
  }
  try {
    const buffer = await QRCode.toBuffer(data, {
      type: "png",
      width: 600,
      margin: 4,
      color: {
        dark: fgColor,
        light: bgColor
      }
    });
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (err) {
    return new Response("Failed to generate image", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
