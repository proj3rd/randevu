export function getDocId(docIdWithCollection: string) {
  const index = docIdWithCollection.lastIndexOf('/');
  return docIdWithCollection.substring(index + 1);
}
