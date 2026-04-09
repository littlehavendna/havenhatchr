export const SHOW_STANDARDS_PROFILES = [
  "Open Poultry",
  "APA Poultry",
  "Breed Club",
  "Junior Show",
  "Custom",
] as const;

export const SHOW_AWARD_TEMPLATES = [
  "Default Poultry Awards",
  "APA Style Awards",
  "Breed Club Awards",
  "Waterfowl Awards",
  "Custom Species Awards",
] as const;

export const SHOW_STANDARDS_SUPPORT = [
  {
    species: "Chicken",
    sizeClasses: ["Large Fowl", "Bantam"],
    sexClasses: ["Cock", "Cockerel", "Hen", "Pullet"],
    ageClasses: ["Adult", "Young", "Old Trio", "Young Trio"],
    apaClasses: [
      "American",
      "Asiatic",
      "Mediterranean",
      "Continental",
      "English",
      "Game",
      "All Other Standard Breeds",
      "Bantam",
    ],
    specialShowDivisions: ["Open", "Junior", "Breed Club", "State Meet", "District Meet"],
    awardTemplates: ["Default Poultry Awards", "APA Style Awards", "Breed Club Awards"],
  },
  {
    species: "Quail",
    sizeClasses: ["Standard"],
    sexClasses: ["Male", "Female"],
    ageClasses: ["Adult", "Young"],
    apaClasses: ["Quail"],
    specialShowDivisions: ["Open", "Breed Club", "Custom"],
    awardTemplates: ["Custom Species Awards"],
  },
  {
    species: "Waterfowl",
    sizeClasses: ["Heavy", "Medium", "Light", "Bantam"],
    sexClasses: ["Old Male", "Young Male", "Old Female", "Young Female"],
    ageClasses: ["Adult", "Young"],
    apaClasses: ["Duck", "Goose"],
    specialShowDivisions: ["Open", "Junior", "Specialty"],
    awardTemplates: ["Waterfowl Awards", "Custom Species Awards"],
  },
  {
    species: "Ratite",
    sizeClasses: ["Standard"],
    sexClasses: ["Male", "Female"],
    ageClasses: ["Adult", "Young"],
    apaClasses: ["Ratite"],
    specialShowDivisions: ["Open", "Breeder Showcase"],
    awardTemplates: ["Custom Species Awards"],
  },
  {
    species: "Parrot",
    sizeClasses: ["Companion", "Exhibition"],
    sexClasses: ["Male", "Female", "Unknown"],
    ageClasses: ["Adult", "Young"],
    apaClasses: ["Parrot"],
    specialShowDivisions: ["Open", "Rare Variety", "Custom"],
    awardTemplates: ["Custom Species Awards"],
  },
] as const;
