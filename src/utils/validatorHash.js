export default function validatorHash(blueprint, title) {
  const validators = blueprint?.validators ?? [];
  const validator = validators.find((v) => v.title === title);

  if (!validator) {
    const known = validators.map((v) => v.title).join(", ");
    throw new Error(
      `validatorHash: no validator "${title}" in the blueprint. It has: ${known}`,
    );
  }

  if (!validator.hash) {
    throw new Error(`validatorHash: validator "${title}" has no hash`);
  }

  return validator.hash;
}
