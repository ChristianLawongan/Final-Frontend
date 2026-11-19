
const SYNONYMS = {
  "pengembangan web": "web development",
  "web development": "web development",
  "basis data": "database",
  "database systems": "database",
  "database": "database",
  "rekayasa perangkat lunak": "software engineering",
  "software engineering": "software engineering",
  "kecerdasan buatan": "artificial intelligence",
  "artificial intelligence": "artificial intelligence",
  "pembelajaran mesin": "machine learning",
  "machine learning": "machine learning",
  "penambangan data": "data mining",
  "data mining": "data mining",
  "sistem informasi": "information systems",
  "information systems": "information systems",
  "analisis data": "data analytics",
  "data analytics": "data analytics",
  "keamanan siber": "cybersecurity",
  "cybersecurity": "cybersecurity",
  "keamanan jaringan": "network security",
  "network security": "network security",
  "jaringan komputer": "computer networks",
  "computer networks": "computer networks",
  "statistika": "statistics",
  "statistics": "statistics",
};

function normalize(value) {
  const text = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");

  return SYNONYMS[text] || text;
}

function isRelated(aiTopic, lecturerTopic) {
  const ai = normalize(aiTopic);
  const lecturer = normalize(lecturerTopic);

  if (!ai || !lecturer) return false;

  // Cocok jika istilah sudah dinormalisasi sama
  if (ai === lecturer) return true;

  // Cocok jika salah satu istilah terkandung dalam istilah lainnya
  if (ai.includes(lecturer) || lecturer.includes(ai)) return true;

  // Cocokkan kata penting, abaikan kata umum
  const ignoredWords = [
    "dan", "untuk", "dengan", "pada", "dalam",
    "the", "and", "for", "with", "of", "in",
    "sistem", "system", "analisis", "analysis",
    "pengembangan", "development", "penerapan",
    "implementation", "berbasis", "based"
  ];

  const aiWords = ai.split(" ").filter(
    word => word.length > 2 && !ignoredWords.includes(word)
  );

  const lecturerWords = lecturer.split(" ").filter(
    word => word.length > 2 && !ignoredWords.includes(word)
  );

  return aiWords.some(word => lecturerWords.includes(word));
}

export function matchLecturers(aiAnalysis, lecturers) {
  if (
    !aiAnalysis ||
    !Array.isArray(lecturers)
  ) {
    return [];
  }

  const aiExpertise = [
    ...(aiAnalysis.relevantExpertise || []),
    ...(aiAnalysis.categories || []),
  ];

  if (aiExpertise.length === 0) return [];

  return lecturers
    .map((lecturer) => {
      const expertise = lecturer.expertise || [];
      const research = lecturer.research || [];

      const matchedExpertise = expertise.filter((item) =>
        aiExpertise.some((aiItem) => isRelated(aiItem, item))
      );

      const matchedResearch = research.filter((item) =>
        aiExpertise.some((aiItem) => isRelated(aiItem, item))
      );

      const score =
        matchedExpertise.length * 2 +
        matchedResearch.length;

      return {
        ...lecturer,
        score,
        matchedExpertise,
        matchedResearch,
      };
    })
    .filter((lecturer) => lecturer.score > 0)
    .sort((a, b) => b.score - a.score);
}
