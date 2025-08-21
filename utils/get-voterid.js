const { createWorker } = require("tesseract.js");

/**
 * Verifies and extracts voter ID information from an uploaded image file
 * @param {Object} file - The uploaded file object with path property
 * @returns {Promise<Object>} Object containing extracted voter ID information
 */
async function getVoterByImageID(file) {
  let worker;

  try {
    // Create Tesseract worker
    worker = await createWorker("eng");

    // Perform OCR on the uploaded file
    const ret = await worker.recognize(file.path);
    console.log("OCR Text:", ret.data.text);

    // Split text into lines and clean them
    const lines = ret.data.text.split("\n").map((l) => l.trim());

    // Define regex patterns for different fields
    const idRegex = /^\d{4}(?: \d{4}){3}$/;
    const nameRegex = /^Name:\s*(.+)$/i;
    const fatherRegex = /^Father Name:\s*(.+)$/i;
    const dobRegex = /^Date OF Birth:\s*(.+)$/i;

    // Find the matching lines for each field
    const idLine = lines.find((l) => idRegex.test(l));
    const nameLine = lines.find((l) => nameRegex.test(l));
    const fatherLine = lines.find((l) => fatherRegex.test(l));
    const dobLine = lines.find((l) => dobRegex.test(l));

    // Extract and clean the data
    const idCleaned = idLine?.replace(/\s+/g, "") || "";
    const name = nameLine?.match(nameRegex)?.[1]?.trim() || "";
    const fatherName = fatherLine?.match(fatherRegex)?.[1]?.trim() || "";
    const dateOfBirth = dobLine?.match(dobRegex)?.[1]?.trim() || "";

    // Validation
    if (!idCleaned) {
      throw new Error("Voter ID not found - check format or image quality");
    }

    if (idCleaned.length !== 16) {
      throw new Error("Invalid Voter ID format - should be 16 digits");
    }

    return {
      success: true,
      idCleaned,
    };
  } catch (error) {
    console.error("Error verifying voter ID:", error.message);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    // Always terminate the worker to free up resources
    if (worker) {
      await worker.terminate();
    }
  }
}

module.exports = { getVoterByImageID };
