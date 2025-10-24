import prisma from "@/app/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Share2, 
  Mail, 
  Phone, 
  ExternalLink, 
  Star,
  Clock,
  CheckCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

async function getData(slug: string, serviceId: string) {
  const org = await prisma.organization.findUnique({
    where: {
      slug: slug,
      isPublished: true,
    },
    include: {
      services: {
        where: {
          id: serviceId,
        },
      },
    },
  });

  if (!org || !org.services.length) {
    return notFound();
  }

  return {
    organization: org,
    service: org.services[0],
  };
}

export default async function ServiceDetailPage({ 
  params 
}: { 
  params: { slug: string; serviceId: string } 
}) {
  const { organization, service } = await getData(params.slug, params.serviceId);

  const sampleWork = (service as any).sampleWork as any[] || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            {/* Top Row - Back Button */}
            <div className="flex items-center justify-between mb-3">
              <Link href={`/portfolio/${params.slug}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Link href={`/portfolio/${params.slug}#contact`}>
                  <Button size="sm">
                    <Mail className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            {/* Bottom Row - Organization Info */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src={organization.logo || "/placeholder.svg"}
                  alt={organization.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-semibold text-foreground truncate">{organization.name}</h1>
                <p className="text-sm text-muted-foreground truncate">{organization.tagline}</p>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href={`/portfolio/${params.slug}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <Image
                    src={organization.logo || "/placeholder.svg"}
                    alt={organization.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-foreground">{organization.name}</h1>
                  <p className="text-sm text-muted-foreground">{organization.tagline}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Link href={`/portfolio/${params.slug}#contact`}>
                <Button size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Get Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Service Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                      <Image
                        src={service.logo || "/placeholder.svg"}
                        alt={service.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-xl sm:text-2xl text-foreground">{service.title}</CardTitle>
                      <div className="flex items-center gap-2 sm:gap-4 mt-2">
                        {service.pricePerHour ? (
                          <Badge variant="secondary" className="text-sm sm:text-lg font-semibold">
                            ${service.pricePerHour?.toString()}/hour
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Price Available on Request
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              {/* Service Banner */}
              {service.banner && (
                <div className="px-4 sm:px-6 pb-4">
                  <div className="relative w-full h-48 sm:h-64">
                    <Image
                      src={service.banner}
                      alt={service.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}

              <CardContent className="px-4 sm:px-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Service Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Sample Work */}
                  {sampleWork.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-4 text-foreground">Sample Work & Portfolio</h3>
                      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                        {sampleWork.map((work: any, index: number) => (
                          <Card key={work.id || index} className="overflow-hidden bg-card border-border">
                            <div className="relative w-full h-40 sm:h-48">
                              <Image
                                src={work.imageUrl}
                                alt={work.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <CardContent className="p-3 sm:p-4">
                              <h4 className="font-medium mb-2 text-foreground">{work.title}</h4>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                                {work.description}
                              </p>
                              
                              {work.technologies && work.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {work.technologies.map((tech: string, techIndex: number) => (
                                    <Badge key={techIndex} variant="outline" className="text-xs">
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              {work.projectUrl && (
                                <Link href={work.projectUrl} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="outline" className="w-full">
                                    <ExternalLink className="w-3 h-3 mr-2" />
                                    View Project
                                  </Button>
                                </Link>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Contact Card */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">Get Started</CardTitle>
                <CardDescription>
                  Ready to work with us? Let&apos;s discuss your project.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/portfolio/${params.slug}#contact`}>
                  <Button className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Request Quote
                  </Button>
                </Link>
                <Link href={`/portfolio/${params.slug}#contact`}>
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Schedule Call
                  </Button>
                </Link>
              </CardContent>
            </Card>



            {/* Organization Info */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-foreground">About {organization.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {(organization as any).about || organization.description}
                </p>
                <Link href={`/portfolio/${params.slug}`} className="inline-block mt-3">
                  <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
                    View Full Portfolio →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}