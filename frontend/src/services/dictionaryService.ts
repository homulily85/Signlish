export default async function getDictionary(){
  const response = await fetch("http://localhost:8000/dictionary");
  if (!response.ok) {
    throw new Error("Failed to fetch dictionary data");
  }
  return await response.json();
}