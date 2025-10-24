import prisma from "@/app/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, Users, Star, ExternalLink, Linkedin, Twitter, Instagram, Facebook, Pin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

async function getData(slug: string) {
  const org = await prisma.organization.findUnique({
    where: {
      slug: slug,
      isPublished: true,
    },
    include: {
      projects: {
        where: { OR: [{ isFeatured: true }, { isPinned: true }] },
        orderBy: [{ isPinned: "desc" }, { isFeatured: "desc" }, { order: "asc" }],
        take: 12,
      },
      services: {
        orderBy: { order: "asc" },
      },
      clients: {
        orderBy: { order: "asc" },
        take: 12,
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 6,
      },
    },
  });

  if (!org) {
    return notFound();
  }

  return org;
}

export default async function PublicPortfolioPage({ params }: { params: { slug: string } }) {
  const org = await getData(params.slug);

  const avgRating =
    org.reviews.length > 0
      ? (org.reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / org.reviews.length).toFixed(1)
      : "0.0";

  const socialLinks = org.socialLinks as any;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section with Cover Image */}
      {org.coverImage && (
        <div className="relative w-full h-[200px] sm:h-[300px] lg:h-[350px] bg-card">
          <Image
            src={org.coverImage}
            alt={org.name}
            width={1200}
            height={400}
            className="w-full h-full object-contain"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        </div>
      )}

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" style={{marginTop: org.coverImage ? '-5rem' : '2rem'}}>
        {/* Profile Header */}
        <div className="rounded-xl shadow-lg overflow-hidden mb-6 sm:mb-8">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
              {/* Main Profile Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 flex-1">
                {org.logo && (
                  <div className="flex-shrink-0">
                    <Image
                      src={org.logo}
                      alt={org.name}
                      width={100}
                      height={100}
                      className="rounded-xl object-cover shadow-md border border-border"
                      sizes="100px"
                    />
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-white">{org.name}</h1>
                  {org.tagline && (
                    <p className="text-lg sm:text-xl text-white font-bold mb-6">{org.tagline}</p>
                  )}
                  {/* Info Badges */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-sm text-white font-bold mb-6">
                    {org.location && (
                      <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                        <MapPin className="w-4 h-4" />
                        {org.location}
                      </span>
                    )}
                    {org.teamSize && (
                      <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                        <Users className="w-4 h-4" />
                        {org.teamSize} team
                      </span>
                    )}
                    {org.website && (
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full hover:bg-muted transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center sm:justify-start gap-3">
                    {socialLinks?.linkedin && (
                      <Button asChild variant="outline" size="sm">
                        <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    {socialLinks?.twitter && (
                      <Button asChild variant="outline" size="sm">
                        <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    {socialLinks?.instagram && (
                      <Button asChild variant="outline" size="sm">
                        <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                          <Instagram className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    {socialLinks?.facebook && (
                      <Button asChild variant="outline" size="sm">
                        <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                          <Facebook className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-3 gap-4 lg:gap-6 bg-muted/30 rounded-lg p-4 sm:p-6">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{org.projects.length}</p>
                  <p className="text-sm text-white font-bold">Projects</p>
                </div>
                <div className="text-center border-l border-r border-border">
                  <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{org.clients.length}</p>
                  <p className="text-sm text-white font-bold">Clients</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{avgRating}</p>
                  <p className="text-sm text-white font-bold">Rating</p>
                </div>
              </div>
            </div>

            {/* About Section */}
            {org.description && (
              <div className="mt-8 pt-6 border-t border-border">
                <h2 className="text-xl font-bold mb-4 text-white">About {org.name}</h2>
                <div className="bg-muted/20 rounded-lg p-4 sm:p-6">
                  <p className="text-base text-white font-bold whitespace-pre-wrap leading-relaxed">{org.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Featured Clients */}
        {org.clients.length > 0 && (
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">Featured Clients</h2>
            <Card className="bg-card border-border">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-8 items-center">
                  {org.clients.map((client: any) => (
                    <div key={client.id} className="flex items-center justify-center p-2">
                      {client.logo ? (
                        <Image
                          src={client.logo}
                          alt={client.name}
                          width={80}
                          height={50}
                          className="object-contain grayscale hover:grayscale-0 transition max-w-full max-h-12 sm:max-h-16"
                        />
                      ) : (
                        <div className="text-center text-sm font-medium text-muted-foreground">
                          {client.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Projects Section */}
        {org.projects.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Projects</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {org.projects.map((project: any) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group bg-card border-border">
                  {project.coverImage && (
                    <div className="relative h-40 sm:h-56 w-full overflow-hidden">
                      <Image
                        src={project.coverImage}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={project.isFeatured}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        {project.isPinned && (
                          <Badge className="bg-green-500 text-white border-0 shadow-lg">
                            <Pin className="size-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        {project.isFeatured && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
                            <Star className="size-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {!project.coverImage && (
                    <div className="h-40 sm:h-56 w-full bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl mb-3">🎨</div>
                        <p className="text-sm text-muted-foreground font-medium">Project Image</p>
                      </div>
                    </div>
                  )}
                  <CardHeader className="p-4 sm:p-6">
                    <div className="space-y-3">
                      <CardTitle className="text-lg sm:text-xl font-bold group-hover:text-primary transition-colors text-foreground">{project.title}</CardTitle>
                      {project.description && (
                        <CardDescription className="text-xs sm:text-sm leading-relaxed line-clamp-3">
                          {project.description}
                        </CardDescription>
                      )}
                      {project.date && (
                        <p className="text-xs text-muted-foreground font-medium">
                          📅 {project.date}
                        </p>
                      )}
                      {project.tags && Array.isArray(project.tags) && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {(project.tags as string[]).slice(0, 4).map((tag: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary border-0">
                              {tag}
                            </Badge>
                          ))}
                          {(project.tags as string[]).length > 4 && (
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              +{(project.tags as string[]).length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  {project.projectUrl && (
                    <CardContent className="pt-0 pb-4 sm:pb-6 px-4 sm:px-6">
                      <Button asChild variant="default" size="sm" className="w-full group-hover:shadow-md transition-shadow">
                        <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                          <span>View Project</span>
                          <ExternalLink className="size-3" />
                        </a>
                      </Button>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Services Section */}
        {org.services.length > 0 && (
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">Our Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {org.services.map((service: any) => (
                <Card key={service.id} className="overflow-hidden bg-card border-border">
                  {/* Service Banner */}
                  {service.banner && (
                    <div className="relative h-28 sm:h-32 w-full">
                      <Image
                        src={service.banner}
                        alt={service.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start gap-3">
                      {/* Service Logo */}
                      {service.logo && (
                        <Image
                          src={service.logo}
                          alt={service.title}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover flex-shrink-0 sm:w-12 sm:h-12"
                          sizes="48px"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-foreground">
                          {service.icon && <span className="text-lg sm:text-xl">{service.icon}</span>}
                          <span className="truncate">{service.title}</span>
                        </CardTitle>
                        {service.description && (
                          <CardDescription className="mt-2 text-xs sm:text-sm line-clamp-2">{service.description}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="space-y-3 sm:space-y-4">
                      {service.pricePerHour ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg sm:text-2xl font-bold text-foreground">
                            {org.currency || "USD"} {service.pricePerHour.toString()}
                          </span>
                          <span className="text-xs sm:text-sm text-muted-foreground">/hour</span>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-muted-foreground">Price Available on Request</p>
                      )}
                      
                      <div className="flex gap-2">
                        <Button asChild size="sm" className="flex-1 text-xs sm:text-sm">
                          <Link href={`/portfolio/${params.slug}/service/${service.id}`}>
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">Details</span>
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex-1 text-xs sm:text-sm">
                          <Link href={`/portfolio/${params.slug}#contact`}>
                            <span className="hidden sm:inline">Get Quote</span>
                            <span className="sm:hidden">Quote</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials & Reviews */}
        {org.reviews.length > 0 && (
          <section className="mb-8 sm:mb-12">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">Testimonials & Reviews</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                There are currently {org.reviews.length} testimonials. Average rating: {avgRating}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {org.reviews.map((review: any) => (
                <Card key={review.id} className="bg-card border-border">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-3">
                      {review.authorLogo && (
                        <Image
                          src={review.authorLogo}
                          alt={review.authorName}
                          width={40}
                          height={40}
                          className="rounded-full flex-shrink-0 sm:w-12 sm:h-12"
                        />
                      )}
                      <div className="min-w-0">
                        <CardTitle className="text-sm sm:text-base text-foreground">{review.authorName}</CardTitle>
                        {review.authorCompany && (
                          <CardDescription className="text-xs sm:text-sm">{review.authorCompany}</CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${
                            i < (review.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <p className="text-xs sm:text-sm text-muted-foreground">{review.content}</p>
                    {review.date && (
                      <p className="text-xs text-muted-foreground mt-3">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12 sm:mt-16 py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground">
        <div className="container max-w-6xl mx-auto px-4">
          <p>© {new Date().getFullYear()} {org.name}. All rights reserved.</p>
          <p className="mt-2">
            Powered by{" "}
            <Link href="/" className="text-primary hover:underline">
              BEST-Mate
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
