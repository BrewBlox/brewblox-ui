export function spreadData(input: any) {
  const spreadInput = {
    ...input.data,
    ...input,
  };

  delete spreadInput.data;

  return spreadInput;
}

export function unspreadData(input: any) {
  const { id, type, profiles } = input;
  const data = { ...input };

  // remove top level properties from data
  delete data.id;
  delete data.type;
  delete data.profiles;

  return {
    // conditionally spread top level properties
    ...(id ? { id } : {}),
    ...(type ? { type } : {}),
    ...(profiles ? { profiles } : {}),
    // include the data object
    data,
  };
}
