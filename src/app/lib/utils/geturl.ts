export class getUrls {
  static getUrl(url: string, resource_type: string | undefined = "image") {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${resource_type}/upload/${url}`;
  }
}
