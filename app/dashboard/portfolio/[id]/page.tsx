import { requireUser } from "@/app/lib/hooks";
import prisma from "@/app/lib/db";
import { notFound, redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Briefcase,
  Globe,
  MapPin,
  Users,
  MoreVertical,
  ExternalLink,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash,
  Star,
  Pin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  toggleOrganizationPublishAction,
  deleteProjectAction,
  deleteServiceAction,
  deleteClientAction,
  deleteReviewAction,
} from "@/app/portfolioActions";

async function getData(userId: string, orgId: string) {
  const org = await prisma.organization.findFirst({
    where: {
      id: orgId,
      userId: userId,
    },
    include: {
      projects: {
        orderBy: [{ isPinned: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      },
      services: {
        orderBy: { order: "asc" },
      },
      clients: {
        orderBy: { order: "asc" },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!org) {
    return notFound();
  }

  return org;
}

export default async function PortfolioManagePage({ params }: { params: { id: string } }) {
  const session = await requireUser();
  const org = await getData(session.user?.id as string, params.id);

  const avgRating =
    org.reviews.length > 0
      ? (org.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / org.reviews.length).toFixed(1)
      : "0.0";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex gap-4 flex-1 min-w-0">
          {org.logo && (
            <Image
              src={org.logo}
              alt={org.name}
              width={80}
              height={80}
              className="rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-bold truncate">{org.name}</h1>
              <Badge variant={org.isPublished ? "default" : "secondary"} className="flex-shrink-0">
                {org.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            {org.tagline && <p className="text-muted-foreground mt-1 line-clamp-2">{org.tagline}</p>}
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              {org.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  <span className="truncate">{org.location}</span>
                </span>
              )}
              {org.website && (
                <a
                  href={org.website}
                  target="_blank"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Globe className="size-4" />
                  Website
                  <ExternalLink className="size-3" />
                </a>
              )}
              {org.teamSize && (
                <span className="flex items-center gap-1">
                  <Users className="size-4" />
                  {org.teamSize}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <form action={toggleOrganizationPublishAction.bind(null, org.id) as any}>
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              {org.isPublished ? (
                <>
                  <EyeOff className="size-4 mr-2" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="size-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </form>
          {org.isPublished && (
            <Button asChild size="sm" className="whitespace-nowrap">
              <Link href={`/portfolio/${org.slug}`} target="_blank">
                <ExternalLink className="size-4 mr-2" />
                View Live
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="whitespace-nowrap">
            <Link href={`/dashboard/portfolio/${org.id}/edit`}>
              <Edit className="size-4 mr-2" />
              Edit Details
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Projects</p>
              <p className="text-2xl font-bold">{org.projects.length}</p>
            </div>
            <Briefcase className="size-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Services</p>
              <p className="text-2xl font-bold">{org.services.length}</p>
            </div>
            <Users className="size-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Clients</p>
              <p className="text-2xl font-bold">{org.clients.length}</p>
            </div>
            <Users className="size-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rating</p>
              <p className="text-2xl font-bold">{avgRating}</p>
              <p className="text-xs text-muted-foreground">{org.reviews.length} reviews</p>
            </div>
            <Star className="size-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="projects" className="text-xs sm:text-sm">Projects</TabsTrigger>
          <TabsTrigger value="services" className="text-xs sm:text-sm">Services</TabsTrigger>
          <TabsTrigger value="clients" className="text-xs sm:text-sm">Clients</TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs sm:text-sm">Reviews</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{org.projects.length} projects</p>
            <Button asChild size="sm">
              <Link href={`/dashboard/portfolio/${org.id}/project/new`}>
                <Plus className="size-4 mr-2" />
                Add Project
              </Link>
            </Button>
          </div>

          {org.projects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="size-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No projects yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Start showcasing your work by adding your first project.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {org.projects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group bg-card border-border">
                  {project.coverImage && (
                    <div className="relative h-40 sm:h-48 w-full overflow-hidden">
                      <Image
                        src={project.coverImage}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        {project.isPinned && (
                          <Badge className="bg-green-500/90 text-white border-0 shadow-sm">
                            <Pin className="size-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        {project.isFeatured && (
                          <Badge className="bg-orange-500/90 text-white border-0 shadow-sm">
                            <Star className="size-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {!project.coverImage && (
                    <div className="h-48 w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🎨</div>
                        <p className="text-sm text-muted-foreground">No image</p>
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        {project.description && (
                          <CardDescription className="line-clamp-2 mt-1">
                            {project.description}
                          </CardDescription>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/portfolio/${org.id}/project/${project.id}`}>
                              <Edit className="size-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <form action={deleteProjectAction.bind(null, project.id) as any}>
                              <button type="submit" className="flex items-center w-full text-destructive">
                                <Trash className="size-4 mr-2" />
                                Delete
                              </button>
                            </form>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {project.tags && Array.isArray(project.tags) && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(project.tags as string[]).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{org.services.length} services</p>
            <Button asChild size="sm">
              <Link href={`/dashboard/portfolio/${org.id}/service/new`}>
                <Plus className="size-4 mr-2" />
                Add Service
              </Link>
            </Button>
          </div>

          {org.services.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="size-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No services yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add services you offer to showcase your capabilities.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {org.services.map((service) => (
                <Card key={service.id} className="bg-card border-border overflow-hidden">
                  {/* Service Banner */}
                  {(service as any).banner && (
                    <div className="relative h-24 sm:h-28 w-full">
                      <Image
                        src={(service as any).banner}
                        alt={service.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Service Logo */}
                        {(service as any).logo && (
                          <Image
                            src={(service as any).logo}
                            alt={service.title}
                            width={32}
                            height={32}
                            className="rounded-lg object-cover flex-shrink-0 sm:w-10 sm:h-10"
                            sizes="40px"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg text-foreground truncate flex items-center gap-2">
                            {(service as any).icon && <span className="text-base sm:text-lg">{(service as any).icon}</span>}
                            <span>{service.title}</span>
                          </CardTitle>
                          {service.description && (
                            <CardDescription className="mt-1 text-xs sm:text-sm line-clamp-2">{service.description}</CardDescription>
                          )}
                          {service.pricePerHour && (
                            <p className="text-xs sm:text-sm font-semibold mt-2 text-foreground">
                              {org.currency || "USD"} {service.pricePerHour.toString()}/hour
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/portfolio/${org.id}/service/${service.id}`}>
                              <Edit className="size-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <form action={deleteServiceAction.bind(null, service.id) as any}>
                              <button type="submit" className="flex items-center w-full text-destructive">
                                <Trash className="size-4 mr-2" />
                                Delete
                              </button>
                            </form>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{org.clients.length} clients</p>
            <Button asChild size="sm">
              <Link href={`/dashboard/portfolio/${org.id}/client/new`}>
                <Plus className="size-4 mr-2" />
                Add Client
              </Link>
            </Button>
          </div>

          {org.clients.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="size-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No clients yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Feature client logos to build trust and credibility.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {org.clients.map((client) => (
                <Card key={client.id} className="relative bg-card border-border">
                  <CardContent className="p-2 sm:p-4 flex flex-col items-center justify-center min-h-[80px] sm:min-h-[100px]">
                    {client.logo ? (
                      <Image
                        src={client.logo}
                        alt={client.name}
                        width={60}
                        height={60}
                        className="object-contain max-w-full max-h-12 sm:max-h-16"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-muted rounded">
                        <p className="text-xs sm:text-sm font-medium text-center text-foreground">{client.name}</p>
                      </div>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 size-6"
                        >
                          <MoreVertical className="size-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/portfolio/${org.id}/client/${client.id}`}>
                            <Edit className="size-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <form action={deleteClientAction.bind(null, client.id) as any}>
                            <button type="submit" className="flex items-center w-full text-destructive">
                              <Trash className="size-4 mr-2" />
                              Delete
                            </button>
                          </form>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {org.reviews.length} reviews · {avgRating} average rating
            </p>
            <Button asChild size="sm">
              <Link href={`/dashboard/portfolio/${org.id}/review/new`}>
                <Plus className="size-4 mr-2" />
                Add Review
              </Link>
            </Button>
          </div>

          {org.reviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Star className="size-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No reviews yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Showcase testimonials from satisfied clients.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {org.reviews.map((review) => (
                <Card key={review.id} className="bg-card border-border">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
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
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`size-4 ${
                                  i < (review.rating || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/portfolio/${org.id}/review/${review.id}`}>
                              <Edit className="size-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <form action={deleteReviewAction.bind(null, review.id) as any}>
                              <button type="submit" className="flex items-center w-full text-destructive">
                                <Trash className="size-4 mr-2" />
                                Delete
                              </button>
                            </form>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{review.content}</p>
                    {review.date && (
                      <p className="text-xs text-muted-foreground mt-2">{review.date}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
