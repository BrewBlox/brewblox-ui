export function spreadData(input: any) {
  const spreadInput = {
    ...input.data,
    ...input,
  };

  delete spreadInput.data;

  return spreadInput;
}

export function unspreadData(input: any) {
  const { id, type } = input;
  const data = { ...input };

  // remove id and type from data
  delete data.id;
  delete data.type;

  return {
    // conditionally spread id and type
    ...(id ? { id } : {}),
    ...(type ? { type } : {}),
    // include the data object
    data,
  };
}
