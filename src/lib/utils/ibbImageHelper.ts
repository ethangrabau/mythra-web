// Convert ibb.co to i.ibb.co link
function getDirectImageUrl(ibbLink: string) {
  const id = ibbLink.split('/').pop();

  console.log('ibb link id: ', id);
  return `https://i.ibb.co/${id}/image.jpg`;
}
