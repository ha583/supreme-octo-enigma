import { Button } from "@/components/ui/button";
import Link from "next/link";
import { requireUser } from "@/app/lib/hooks";
import prisma from "@/app/lib/db";
import { EmptyState } from "@/app/components/dashboard/EmptyState";
import { Briefcase, ExternalLink, Pen, Settings, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

async function getData(userId: string) {
  const organizations = await prisma.organization.findMany({
    where: {
      userId: userId,
    },
    include: {
      projects: {
        take: 3,
      },
      _count: {
        select: {
          projects: true,
          services: true,
          clients: true,
          reviews: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return organizations;
}

export default async function PortfolioPage() {
  const session = await requireUser();
  const organizations = await getData(session.user?.id as string);

  return (
    <>
      <div className="flex items-center justify-between px-2">
        <div className="sm:grid gap-1 hidden">
          <h1 className="font-heading text-3xl md:text-4xl">Portfolio</h1>
          <p className="text-lg text-muted-foreground">
            Create and manage your portfolio organizations.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/portfolio/new">Create New Portfolio</Link>
        </Button>
      </div>

      {organizations.length === 0 ? (
        <EmptyState
          title="No Portfolio Yet"
          description="Create your first portfolio organization to showcase your work, services, and clients."
          buttonText="Create Portfolio"
          href="/dashboard/portfolio/new"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="overflow-hidden shadow rounded-lg border relative"
            >
              <div className="absolute top-2 right-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-20" align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {org.slug && org.isPublished && (
                        <DropdownMenuItem asChild>
                          <Link href={`/portfolio/${org.slug}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            <span>View Live</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/portfolio/${org.id}`}>
                          <Pen className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/portfolio/${org.id}/delete`}>
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {org.coverImage && (
                <div className="relative h-32 w-full">
                  <Image
                    src={org.coverImage}
                    alt={org.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <Link href={`/dashboard/portfolio/${org.id}`}>
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    {org.logo && (
                      <div className="flex-shrink-0 relative size-12 rounded-full overflow-hidden border-2 border-background">
                        <Image
                          src={org.logo}
                          alt={org.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold truncate">
                          {org.name}
                        </h3>
                        {org.isPublished ? (
                          <Badge variant="default" className="text-xs">
                            Live
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Draft
                          </Badge>
                        )}
                      </div>
                      {org.tagline && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {org.tagline}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                    <span>{org._count.projects} Projects</span>
                    <span>{org._count.services} Services</span>
                    <span>{org._count.clients} Clients</span>
                  </div>
                </div>
              </Link>

              <div className="bg-muted dark:bg-gray-900 px-5 py-3">
                <Link href={`/dashboard/portfolio/${org.id}`}>
                  <Button className="w-full">Manage Portfolio</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
