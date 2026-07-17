/**
 * Build responsive Unsplash URLs; pass through other hosts unchanged.
 */
export function hotelImageProps(url, { widths = [400, 800], sizes = "(max-width: 720px) 100vw, 33vw" } = {}) {
  if (!url) return { src: "", alt: "" };

  if (!url.includes("images.unsplash.com")) {
    return { src: url, loading: "lazy", decoding: "async" };
  }

  const cleaned = url
    .replace(/([?&])w=\d+/g, "$1")
    .replace(/([?&])q=\d+/g, "$1")
    .replace(/[?&]$/, "")
    .replace(/\?&/, "?");

  const join = cleaned.includes("?") ? "&" : "?";
  const src = `${cleaned}${join}w=${widths[0]}&q=75&auto=format&fit=crop`;
  const srcSet = widths
    .map((w) => `${cleaned}${join}w=${w}&q=75&auto=format&fit=crop ${w}w`)
    .join(", ");

  return {
    src,
    srcSet,
    sizes,
    loading: "lazy",
    decoding: "async",
  };
}

export const HERO_IMAGE_BASE =
  "https://images.unsplash.com/photo-1501117716987-c8e1ecb210d6";

export function heroImageUrl(width = 1600) {
  return `${HERO_IMAGE_BASE}?w=${width}&q=80&auto=format&fit=crop`;
}
