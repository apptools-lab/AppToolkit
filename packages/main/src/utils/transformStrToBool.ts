export default function transformStrToBool(obj: Record<string, any>): Record<string, any> {
  if (typeof obj !== 'object') {
    throw new Error('The param type is not object. ');
  }
  const keys = Object.keys(obj);
  const result: Record<string, any> = {};
  for (const key of keys) {
    const value = obj[key];
    if (value === 'true' || value === 'false') {
      result[key] = value === 'true';
    } else {
      result[key] = value;
    }
  }

  return result;
}
