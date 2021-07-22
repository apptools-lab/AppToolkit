function removeObjEmptyValue<T extends Object>(obj: T) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    if (obj[key] instanceof Object) {
      removeObjEmptyValue(obj[key]);
    } else if (obj[key] === undefined || obj[key] === null) {
      delete obj[key];
    }
  }
  return obj;
}

export default removeObjEmptyValue;
