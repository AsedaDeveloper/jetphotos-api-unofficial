const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async(req, res) => {
    const { aircraft_type, registration, serial, airline, photographer } = req.query;

    if (!aircraft_type && !registration && !serial && !airline && !photographer) {
        return res.status(400).json({ error: "Please provide at least one search parameter." });
    }

    // Construct the search URL for JetPhotos
    const searchURL = `https://www.jetphotos.com/photos?search=${aircraft_type}&registration=${registration}&serial=${serial}&airline=${airline}&photographer=${photographer}`;

    try {
        // Fetch the page content
        const response = await axios.get(searchURL);

        // Parse the page content
        const $ = cheerio.load(response.data);
        const results = [];

        $('div.photo-container').each((i, element) => {
            const imageUrl = $(element).find('img').attr('src');
            const photoLink = $(element).find('a').attr('href');
            const aircraftType = $(element).find('span.aircraft-type').text().trim();
            const registration = $(element).find('span.registration').text().trim();
            const serial = $(element).find('span.serial').text().trim();
            const airline = $(element).find('span.airline').text().trim();
            const photographer = $(element).find('span.photographer').text().trim();

            results.push({
                image_url: imageUrl,
                aircraft_type: aircraftType,
                registration: registration,
                serial_number: serial,
                airline: airline,
                photographer: photographer,
                photo_url: `https://www.jetphotos.com${photoLink}`,
            });
        });

        if (results.length === 0) {
            return res.status(404).json({ message: "No results found" });
        }

        // Return the results as JSON
        res.status(200).json({ results });
    } catch (error) {
        console.error("Error fetching photos:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};