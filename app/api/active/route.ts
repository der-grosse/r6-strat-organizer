let currentURL: string | null =
  "https://docs.google.com/drawings/d/1wI5YeJ68mHton_NRr_HhspkEPvRDFFSc_hBgj2Vg7aU/preview";

export async function GET(request: Request) {
  return Response.json(currentURL);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { url } = body;
  if (url) {
    currentURL = url;
  } else {
    return Response.json({ error: "No URL provided" }, { status: 400 });
  }
  return Response.json(currentURL);
}
