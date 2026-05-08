(function () {
  const params = new URLSearchParams(window.location.search);
  const utmCampaign = params.get("utm_campaign");
  if (!utmCampaign) return;
  const url = new URL("https://n8n.netconn.pro/webhook/utm-catch");
  url.searchParams.set("utm_campaign", utmCampaign);
  fetch(url.toString(), { method: "POST", mode: "no-cors" }).catch((err) =>
    console.error("UTM campaign tracking failed:", err)
  );
})();
