import { getQuizzes } from "@/lib/actions/quiz.actions"

export const dynamic = "force-dynamic"
import { CreateQuizDialog } from "@/components/teacher/quiz/create-quiz-dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, FileQuestion } from "lucide-react"
import { QuizActions } from "@/components/teacher/quiz/quiz-actions"
import { format } from "date-fns"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export default async function QuizManagerPage() {
    const { quizzes, error } = await getQuizzes()

    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="Quiz Manager" />
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
                <CreateQuizDialog />
            </div>

            {error ? (
                <div className="p-4 rounded-md bg-destructive/10 text-destructive">
                    Error loading quizzes: {error}
                </div>
            ) : quizzes && quizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz: { id: any; title: any; description: any; _count?: any; updatedAt?: any }) => (
                        <Card key={quiz.id} className="flex flex-col">
                            <CardHeader className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="line-clamp-1" title={quiz.title}>
                                            {quiz.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {quiz.description || "No description provided."}
                                        </CardDescription>
                                    </div>
                                    <QuizActions quiz={quiz} />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 pb-4">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <FileQuestion className="h-4 w-4" />
                                        <span>{quiz._count.questions} questions</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{format(new Date(quiz.updatedAt), "MMM d, yyyy")}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/teacher/quiz-manager/${quiz.id}`}>
                                        Manage Questions
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[300px] border rounded-lg bg-muted/30 text-center p-8">
                    <div className="rounded-full bg-background p-4 mb-4 shadow-sm">
                        <FileQuestion className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No quizzes yet</h3>
                    <p className="text-muted-foreground max-w-sm mb-4">
                        Create your first quiz to start assigning them to your students.
                    </p>
                    <CreateQuizDialog />
                </div>
            )}
        </div>
    )
}

