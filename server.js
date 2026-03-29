import axios from "axios";

async function getSong() {
  try {
    const res = await axios.get(
      "https://saavn-api.vercel.app/search/songs?query=ishqa ve"
    );
    console.log("--- JioSaavn API Response (First Result) ---");
    console.log(res.data.data.results[0]);
  } catch (error) {
    console.error("API Call Failed:", error.message);
  }
}

getSong();
