import { Navigate, useParams } from 'react-router-dom';
import { getPage } from '../services/bookContent';

/**
 * Legacy deep links now land inside the chapter's continuous reading flow.
 */
export const BookPageRoute = () => {
  const { pageId } = useParams<{ pageId?: string }>();
  const page = pageId ? getPage(pageId) : undefined;

  if (!page) return <Navigate to="/book" replace />;

  return <Navigate to={`/book/chapter/${page.chapterId}#story-${page.id}`} replace />;
};
