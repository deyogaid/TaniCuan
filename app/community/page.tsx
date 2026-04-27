'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MobileNav } from '@/components/mobile-nav'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, MessageSquare, Send, Users } from 'lucide-react'

type Comment = {
    id: string
    author: string
    content: string
}

type Post = {
    id: string
    author: string
    role: string
    createdAt: string
    content: string
    comments: Comment[]
}

const initialPosts: Post[] = [
    {
        id: 'post-1',
        author: 'Siti Petani',
        role: 'Petani Cabai',
        createdAt: '15 menit lalu',
        content: 'Harga cabai merah tadi pagi di pasar dekat Brebes naik 10%. Siapa yang juga menghadapi stok menipis?',
        comments: [
            { id: 'comment-1', author: 'Budi', content: 'Saya juga lihat harga naik, stok mulai menipis di gudang.' },
        ],
    },
    {
        id: 'post-2',
        author: 'Ibu Ratna',
        role: 'Petani Bawang',
        createdAt: '1 jam lalu',
        content: 'Tolong rekomendasi pasar terbaik untuk bawang merah di Jawa Tengah minggu ini.',
        comments: [],
    },
]

export default function CommunityPage() {
    const router = useRouter()
    const [posts, setPosts] = useState<Post[]>(initialPosts)
    const [newPost, setNewPost] = useState('')
    const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null)
    const [commentText, setCommentText] = useState('')
    const [messageInfo, setMessageInfo] = useState<string | null>(null)

    const handleTabChange = (tab: string) => {
        if (tab === 'home') {
            router.push('/')
        } else if (tab === 'analysis') {
            router.push('/analysis')
        } else if (tab === 'profile') {
            router.push('/profile')
        }
    }

    const publishPost = () => {
        const content = newPost.trim()
        if (!content) return

        const createdPost: Post = {
            id: `post-${Date.now()}`,
            author: 'Anda',
            role: 'Petani Lokal',
            createdAt: 'Baru saja',
            content,
            comments: [],
        }

        setPosts([createdPost, ...posts])
        setNewPost('')
        setActiveCommentPost(createdPost.id)
    }

    const addComment = (postId: string) => {
        const content = commentText.trim()
        if (!content) return

        setPosts(posts.map(post => {
            if (post.id !== postId) return post
            return {
                ...post,
                comments: [...post.comments, {
                    id: `comment-${Date.now()}`,
                    author: 'Anda',
                    content,
                }],
            }
        }))

        setCommentText('')
        setActiveCommentPost(null)
    }

    const sendMessage = (recipient: string) => {
        setMessageInfo(`Pesan dikirim ke ${recipient}. Selamat berkomunikasi dengan petani lain!`)
        setTimeout(() => setMessageInfo(null), 4000)
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="sticky top-0 z-50 bg-primary text-primary-foreground border-b border-primary/10">
                <div className="flex items-center justify-between px-4 py-4">
                    <div>
                        <h1 className="text-xl font-semibold">Sosial Petani</h1>
                        <p className="text-sm text-primary/80">Tempat berbagi informasi harga, komentar, dan kirim pesan antar petani.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <span className="text-sm">Komunitas aktif</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 pb-24 space-y-4">
                <section className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Buat Post Baru</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Textarea
                                value={newPost}
                                onChange={(event) => setNewPost(event.target.value)}
                                placeholder="Bagikan informasi harga atau pengalamanmu kepada komunitas..."
                                rows={4}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button onClick={publishPost} disabled={!newPost.trim()}>
                                <Send className="w-4 h-4 mr-2" />
                                Posting
                            </Button>
                        </CardFooter>
                    </Card>
                </section>

                {messageInfo ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                        {messageInfo}
                    </div>
                ) : null}

                <section className="space-y-4">
                    {posts.map(post => (
                        <Card key={post.id}>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={undefined} alt={post.author} />
                                        <AvatarFallback>{post.author.split(' ').map(name => name[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="font-semibold">{post.author}</h2>
                                            <Badge variant="secondary">{post.role}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{post.createdAt}</p>
                                    </div>
                                </div>
                                <p className="whitespace-pre-line text-sm leading-6">{post.content}</p>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                                        className="gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        {post.comments.length > 0 ? `${post.comments.length} Komentar` : 'Komentar'}
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={() => sendMessage(post.author)} className="gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Kirim Pesan
                                    </Button>
                                </div>

                                {activeCommentPost === post.id && (
                                    <div className="space-y-3">
                                        <Textarea
                                            value={commentText}
                                            onChange={(event) => setCommentText(event.target.value)}
                                            placeholder="Tulis komentar..."
                                            rows={3}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setActiveCommentPost(null)}>
                                                Batal
                                            </Button>
                                            <Button size="sm" onClick={() => addComment(post.id)} disabled={!commentText.trim()}>
                                                Tambah Komentar
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {post.comments.length > 0 && (
                                    <div className="space-y-2 pt-3 border-t border-border/70">
                                        {post.comments.map(comment => (
                                            <div key={comment.id} className="rounded-2xl bg-muted/10 p-3">
                                                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                                    <span>{comment.author}</span>
                                                    <span>Baru</span>
                                                </div>
                                                <p className="mt-1 text-sm">{comment.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </section>
            </main>

            <MobileNav activeTab="community" onTabChange={handleTabChange} />
        </div>
    )
}
