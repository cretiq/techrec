import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Suspense } from "react";
import { Card, CardContent } from '@/components/ui-daisy/card';
import { Badge } from '@/components/ui-daisy/badge';
import { Button } from '@/components/ui-daisy/button';
import { 
  Trophy, 
  ArrowLeft, 
  Filter, 
  Search,
  CheckCircle2,
  Target,
  Star
} from "lucide-react";
import Link from "next/link";
import { BadgeGallery } from "@/components/badges/BadgeGallery";
import { getBadgesForDeveloper } from "@/lib/gamification/data";

/**
 * Developer Badges Page
 * 
 * Displays all available badges and the user's badge collection progress.
 */
export default async function BadgesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  console.log('🏆 [BadgesPage] Loading badges page for user:', session.user?.email);

  const badges = await getBadgesForDeveloper(session.user.id);

  const earnedCount = badges.filter(b => b.isEarned).length;
  const inProgressCount = badges.filter(b => b.isInProgress).length;
  const rareBadgesCount = badges.filter(b => b.isEarned && (b.rarity === 'RARE' || b.rarity === 'EPIC' || b.rarity === 'LEGENDARY')).length;
  // Avoid division by zero if there are no badges defined
  const completionPercentage = badges.length > 0 ? Math.round((earnedCount / badges.length) * 100) : 0;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8" data-testid="badges-page">
      
      {/* Header */}
      <div className="mb-8" data-testid="badges-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/developer/dashboard">
              <Button variant="ghost" size="sm" data-testid="badges-back-button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="h-8 w-px bg-base-300" />
            
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Your Badge Collection
              </h1>
              <p className="text-lg text-base-content/70 mt-2">
                Unlock achievements and showcase your TechRec journey
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" data-testid="badges-filter-button">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" data-testid="badges-search-button">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Badge Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" data-testid="badges-stats">
        <Card 
          variant="transparent" 
          className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
        >
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-base-content">{earnedCount}</div>
            <div className="text-sm text-base-content/70">Badges Earned</div>
          </CardContent>
        </Card>
        
        <Card 
          variant="transparent" 
          className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
        >
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-base-content">{inProgressCount}</div>
            <div className="text-sm text-base-content/70">In Progress</div>
          </CardContent>
        </Card>
        
        <Card 
          variant="transparent" 
          className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
        >
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-base-content">{rareBadgesCount}</div>
            <div className="text-sm text-base-content/70">Rare Badges</div>
          </CardContent>
        </Card>
        
        <Card 
          variant="transparent" 
          className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
        >
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-orange-500/20 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-base-content">{completionPercentage}%</div>
            <div className="text-sm text-base-content/70">Completion</div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Categories (this remains static for now) */}
      <div className="mb-8" data-testid="badges-categories">
        <h2 className="text-2xl font-semibold mb-4">Badge Categories</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'Profile', icon: '👤', count: 5, color: 'text-blue-600 bg-blue-100' },
            { name: 'CV Analysis', icon: '📄', count: 8, color: 'text-green-600 bg-green-100' },
            { name: 'AI Interaction', icon: '🤖', count: 6, color: 'text-purple-600 bg-purple-100' },
            { name: 'Applications', icon: '📝', count: 7, color: 'text-red-600 bg-red-100' },
            { name: 'Engagement', icon: '🔥', count: 4, color: 'text-orange-600 bg-orange-100' },
            { name: 'Special', icon: '⭐', count: 3, color: 'text-yellow-600 bg-yellow-100' }
          ].map((category) => (
            <Card
              key={category.name}
              variant="transparent"
              className="bg-base-100/40 backdrop-blur-sm border border-base-300/50 hover:bg-base-100/60 hover:border-base-300/70 transition-all duration-200 cursor-pointer"
              data-testid={`badges-category-${category.name.toLowerCase().replace(' ', '-')}`}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-semibold text-sm text-base-content">{category.name}</div>
                <Badge 
                  variant="outline" 
                  className={`text-xs mt-2 ${category.color}`}
                >
                  {category.count} badges
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Badge Gallery */}
      <div className="mb-8" data-testid="badges-gallery-section">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">All Badges</h2>
          <div className="flex items-center gap-3">
            <select className="select select-bordered select-sm" data-testid="badges-sort-select">
              <option value="category">Sort by Category</option>
              <option value="tier">Sort by Tier</option>
              <option value="earned">Sort by Earned</option>
              <option value="rarity">Sort by Rarity</option>
            </select>
          </div>
        </div>
        
        <Suspense fallback={<BadgeGallerySkeleton />}>
          <BadgeGallery badges={badges} />
        </Suspense>
      </div>
    </div>
  )
}

// Loading skeleton for badge gallery
function BadgeGallerySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="badges-gallery-skeleton">
      {[...Array(12)].map((_, i) => (
        <Card
          key={i}
          variant="transparent"
          className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-base-300/50 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-base-300/50 rounded animate-pulse" />
                <div className="h-3 bg-base-300/30 rounded animate-pulse w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}