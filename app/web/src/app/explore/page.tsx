import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

const trending = [
  { id: "c1", name: "Luna", bio: "Cosplay & lifestyle", posts: 42 },
  { id: "c2", name: "Kai", bio: "Fitness & coaching", posts: 31 },
  { id: "c3", name: "Mira", bio: "Art & photo", posts: 18 },
]
const newcomers = [
  { id: "c4", name: "Nova", bio: "Voyages & aventures", posts: 5 },
  { id: "c5", name: "Ely", bio: "Musique & chant", posts: 7 },
]
const recommended = [
  { id: "c6", name: "Zara", bio: "Cuisine healthy", posts: 22 },
  { id: "c7", name: "Leo", bio: "Gaming & streaming", posts: 55 },
]

function CreatorCard({ id, name, bio, posts }: { id: string; name: string; bio: string; posts: number }) {
  return (
    <Link href={`/creator/${id}`}>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-slate-600">{bio}</p>
          </div>
          <Badge variant="default">{posts} posts</Badge>
        </div>
      </Card>
    </Link>
  )
}

export default function ExplorePage() {
  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-semibold">Découverte</h1>

      <div>
        <h2 className="text-lg font-semibold mb-3">🔥 Trending</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {trending.map(c => <CreatorCard key={c.id} {...c} />)}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">✨ Nouveaux créateurs</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {newcomers.map(c => <CreatorCard key={c.id} {...c} />)}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">⭐ Recommandés pour vous</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {recommended.map(c => <CreatorCard key={c.id} {...c} />)}
        </div>
      </div>
    </section>
  )
}
