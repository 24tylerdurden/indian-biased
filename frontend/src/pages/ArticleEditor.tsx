import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { articleApi, type Category } from '@/lib/api-articles';
import { ArrowLeft, Save, Eye, Plus, Trash2 } from 'lucide-react';

interface PerspectiveInput {
  lean: 'left' | 'right' | 'center' | 'neutral';
  headline: string;
  summary: string;
  body: string;
  source_name: string;
  source_url: string;
}

export const ArticleEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [article, setArticle] = useState({
    topic: '',
    slug: '',
    description: '',
    original_url: '',
    category_id: '',
    status: 'draft' as 'draft' | 'published',
    tags: [] as string[],
    image_url: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [perspectives, setPerspectives] = useState<PerspectiveInput[]>([
    { lean: 'left', headline: '', summary: '', body: '', source_name: '', source_url: '' },
    { lean: 'right', headline: '', summary: '', body: '', source_name: '', source_url: '' },
  ]);

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchArticle();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await articleApi.getCategories();
      if (response && response.length > 0) {
        setCategories(response)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const data = await articleApi.getArticleBySlug(id!);
      setArticle({
        topic: data.topic,
        description: data.description || '',
        slug: data.slug,
        original_url: data.original_url || '',
        category_id: data.category_id || '',
        status: data.status as 'draft' | 'published',
        tags: data.tags || [],
        image_url: data.image_url || '',
      });
      // TODO: Load perspectives
    } catch (err) {
      console.error('Failed to fetch article:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !article.tags.includes(tagInput.trim())) {
      setArticle({ ...article, tags: [...article.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setArticle({ ...article, tags: article.tags.filter((t) => t !== tag) });
  };

  const handleAddPerspective = () => {
    setPerspectives([
      ...perspectives,
      { lean: 'center', headline: '', summary: '', body: '', source_name: '', source_url: '' },
    ]);
  };

  const handleRemovePerspective = (index: number) => {
    setPerspectives(perspectives.filter((_, i) => i !== index));
  };

  const handlePerspectiveChange = (index: number, field: keyof PerspectiveInput, value: string) => {
    const updated = [...perspectives];
    updated[index][field] = value as any;
    setPerspectives(updated);
  };

  const generateSlug = (topic: string) => {
    return topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTopicChange = (value: string) => {
    setArticle({ ...article, topic: value, slug: generateSlug(value) });
  };

  const handleSave = async (publish = false) => {
    if (!article.topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    try {
      if (publish) {
        setPublishing(true);
      } else {
        setSaving(true);
      }

      let articleId: string;
      if (isEditing) {
        // Update existing article
        await articleApi.updateArticle(id!, article);
        articleId = id!;
      } else {
        // Create new article
        const result = await articleApi.createArticle(article);
        articleId = result.id;
      }

      // Save perspectives
      for (const perspective of perspectives) {
        if (perspective.headline.trim()) {
          await articleApi.createPerspective({
            article_id: articleId,
            ...perspective,
          });
        }
      }

      // Publish if requested
      if (publish && !isEditing) {
        await articleApi.publishArticle(articleId);
      }

      navigate('/admin');
    } catch (err) {
      console.error('Failed to save article:', err);
      alert('Failed to save article. Please try again.');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{isEditing ? 'Edit Article' : 'New Article'}</h1>
              <p className="text-muted-foreground">Create content with multiple perspectives</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/articles/${article.slug}`} target="_blank">
              <Button variant="outline" disabled={!article.slug}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Link>
            <Button onClick={() => handleSave(false)} disabled={saving || publishing}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving || publishing} variant="default">
              {publishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Article Details */}
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  value={article.topic}
                  onChange={(e) => handleTopicChange(e.target.value)}
                  placeholder="e.g., India's Economic Growth 2025"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={article.slug}
                  onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                  placeholder="indias-economic-growth-2025"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <RichTextEditor
                  value={article.description}
                  onChange={(value) => setArticle({ ...article, description: value })}
                  placeholder="Write a brief description of the article..."
                />
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={article.image_url}
                  onChange={(e) => setArticle({ ...article, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="original_url">Original URL</Label>
                <Input
                  id="original_url"
                  value={article.original_url}
                  onChange={(e) => setArticle({ ...article, original_url: e.target.value })}
                  placeholder="https://example.com/article"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={article.category_id} onValueChange={(value) => setArticle({ ...article, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag"
                  />
                  <Button type="button" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Perspectives */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Perspectives</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={handleAddPerspective}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Perspective
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {perspectives.map((perspective, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-destructive"
                    onClick={() => handleRemovePerspective(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div>
                    <Label>Perspective Lean</Label>
                    <Select
                      value={perspective.lean}
                      onValueChange={(value: any) => handlePerspectiveChange(index, 'lean', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Headline *</Label>
                    <Input
                      value={perspective.headline}
                      onChange={(e) => handlePerspectiveChange(index, 'headline', e.target.value)}
                      placeholder="e.g., Progressive Analysis"
                    />
                  </div>

                  <div>
                    <Label>Summary *</Label>
                    <Textarea
                      value={perspective.summary}
                      onChange={(e) => handlePerspectiveChange(index, 'summary', e.target.value)}
                      placeholder="Brief summary of this perspective"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Body Content</Label>
                    <RichTextEditor
                      value={perspective.body}
                      onChange={(value) => handlePerspectiveChange(index, 'body', value)}
                      placeholder="Write the full perspective content here..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Source Name</Label>
                      <Input
                        value={perspective.source_name}
                        onChange={(e) => handlePerspectiveChange(index, 'source_name', e.target.value)}
                        placeholder="e.g., CNN, Fox News"
                      />
                    </div>
                    <div>
                      <Label>Source URL</Label>
                      <Input
                        value={perspective.source_url}
                        onChange={(e) => handlePerspectiveChange(index, 'source_url', e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
