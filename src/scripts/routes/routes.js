import RegisterPage from '../pages/auth/register/register-page';
import LoginPage from '../pages/auth/login/login-page';
import HomePage from '../pages/home/home-page';
import NewPage from '../pages/new/new-page';
import StoryDetailPage from '../pages/detail/detail-page';
import BookmarkPage from '../pages/bookmark/bookmark-page';
import NotFoundPage from '../pages/404/404-page';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth';

const routes = {
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/new': () => checkAuthenticatedRoute(new NewPage()),
  '/story/:id': () => checkAuthenticatedRoute(new StoryDetailPage()),
  '/bookmark': () => checkAuthenticatedRoute(new BookmarkPage()),
  '/404': () => new NotFoundPage(),
};

export default routes;
