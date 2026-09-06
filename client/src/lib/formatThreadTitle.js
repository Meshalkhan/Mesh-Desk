export function formatThreadTitle(title) {
  if (!title || title === 'New conversation') {
    return 'Untitled thread';
  }
  return title;
}
