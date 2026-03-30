import { useState } from "react";
import { getAISuggestions, getDefaultSuggestions } from "@/services/aiService";
import
    {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
    } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import
    {
        Sparkles,
        Lightbulb,
        Building2,
        AlertTriangle,
        Check,
        RefreshCw,
    } from "lucide-react";

export default function AISuggestions({
    title,
    description,
    category,
    onApplySuggestion,
})
{
    const [suggestions, setSuggestions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [aiPowered, setAiPowered] = useState(false);

    const fetchSuggestions = async () =>
    {
        if (!title || !category)
        {
            setError("Please enter a title and select a category first");
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = await getAISuggestions(title, description, category);

        if (result.success)
        {
            setSuggestions(result.suggestions);
            setAiPowered(result.aiPowered);
        } else
        {

            const defaultResult = await getDefaultSuggestions(category);
            if (defaultResult.success)
            {
                setSuggestions(defaultResult.suggestions);
                setAiPowered(false);
            } else
            {
                setError(result.error || "Failed to get suggestions");
            }
        }

        setIsLoading(false);
    };

    const getPriorityColor = (priority) =>
    {
        const colors = {
            low: "bg-green-100 text-green-800",
            medium: "bg-yellow-100 text-yellow-800",
            high: "bg-red-100 text-red-800",
        };
        return colors[priority] || colors.medium;
    };

    if (!suggestions && !isLoading)
    {
        return (
            <Card className="border-dashed">
                <CardContent className="py-6">
                    <div className="flex flex-col items-center text-center">
                        <Sparkles className="h-8 w-8 text-primary mb-2" />
                        <h4 className="font-medium mb-1">AI Suggestions</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Get AI-powered suggestions to improve your issue report
                        </p>
                        <Button onClick={fetchSuggestions} disabled={!title || !category}>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Get Suggestions
                        </Button>
                        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isLoading)
    {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">AI Suggestions</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        {aiPowered && (
                            <Badge variant="secondary" className="text-xs">
                                AI Powered
                            </Badge>
                        )}
                        <Button variant="ghost" size="icon" onClick={fetchSuggestions}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <CardDescription>
                    Recommendations to improve your report
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {suggestions.improvedTitle && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Suggested Title</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    onApplySuggestion?.("title", suggestions.improvedTitle)
                                }
                            >
                                <Check className="h-3 w-3 mr-1" />
                                Apply
                            </Button>
                        </div>
                        <p className="text-sm bg-muted p-2 rounded">
                            {suggestions.improvedTitle}
                        </p>
                    </div>
                )}

                {suggestions.improvedDescription && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Suggested Description</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    onApplySuggestion?.(
                                        "description",
                                        suggestions.improvedDescription
                                    )
                                }
                            >
                                <Check className="h-3 w-3 mr-1" />
                                Apply
                            </Button>
                        </div>
                        <p className="text-sm bg-muted p-2 rounded line-clamp-3">
                            {suggestions.improvedDescription}
                        </p>
                    </div>
                )}

                <div className="flex flex-wrap gap-3">
                    {suggestions.suggestedDepartment && (
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{suggestions.suggestedDepartment}</span>
                        </div>
                    )}
                    {suggestions.priority && (
                        <Badge className={getPriorityColor(suggestions.priority)}>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {suggestions.priority.charAt(0).toUpperCase() +
                                suggestions.priority.slice(1)}{" "}
                            Priority
                        </Badge>
                    )}
                </div>

                {suggestions.additionalTips &&
                    suggestions.additionalTips.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-sm font-medium flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" />
                                Tips
                            </span>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                {suggestions.additionalTips.map((tip, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-primary">•</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
            </CardContent>
        </Card>
    );
}
