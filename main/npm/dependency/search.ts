import fetch from 'node-fetch';

export async function searchNpmDependencies(query: string) {
  const res = await fetch(`https://api.npms.io/v2/search?from=0&size=25&q=${query}`);
  const { results } = await res.json();
  const npmDependencies = results.map(({ package: { name, version, links } }) => ({
    name,
    version,
    repository: links.repository,
  }));

  return npmDependencies;
}
