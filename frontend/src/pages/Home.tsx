import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFields } from "../hooks/useFields";
import { useFavorites } from "../hooks/useFavorites";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Pagination from "../components/ui/Pagination";

const HeartIcon = ({ filled, onClick }: { filled: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
  >
    <svg
      className={`w-5 h-5 ${filled ? "text-red-500 fill-red-500" : "text-ink-300"}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  </button>
);

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { fields, loading, error, search, page, totalPages, goToPage } = useFields();
  const { favFields, loadingFavs, favPage, favTotalPages, syncFavIds, fetchFavFields, toggle, isFavorite, goToFavPage } = useFavorites();
  const [query, setQuery] = useState("");
  const [showFavs, setShowFavs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!showFavs) {
      const timer = setTimeout(() => {
        search(query);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [query, search, showFavs]);

  useEffect(() => {
    if (!showFavs && fields.length > 0) {
      syncFavIds(fields);
    }
  }, [fields, showFavs, syncFavIds]);

  useEffect(() => {
    if (showFavs) {
      fetchFavFields(favPage);
    }
  }, [showFavs, favPage, fetchFavFields]);

  const displayFields = showFavs ? favFields : fields;
  const displayLoading = showFavs ? loadingFavs : loading;
  const displayPage = showFavs ? favPage : page;
  const displayTotalPages = showFavs ? favTotalPages : totalPages;

  const handleToggleFav = async (fieldId: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await toggle(fieldId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-ink mb-3">
          Encuentra tu <span className="text-pitch">Pitch</span>
        </h1>
        <p className="text-lg text-ink-600 mb-8">
          Juega donde quieras, cuando quieras
        </p>
        <div className="max-w-xl mx-auto flex gap-3 items-center">
          <div className="flex-1">
            <Input
              placeholder="Buscar por deporte, ubicación..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (showFavs) setShowFavs(false);
              }}
            />
          </div>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setShowFavs(!showFavs)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
                showFavs
                  ? "bg-pitch text-white border-pitch"
                  : "bg-white text-ink-600 border-ink-200 hover:border-pitch hover:text-pitch"
              }`}
            >
              <svg
                className={`w-4 h-4 ${showFavs ? "fill-white" : "fill-none"}`}
                fill={showFavs ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {showFavs ? "Todos" : "Favoritos"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <Button variant="outline" onClick={() => search(query)} className="mt-4">
            Reintentar
          </Button>
        </div>
      )}

      {displayLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-ink-100 rounded-lg mb-4" />
              <div className="h-5 bg-ink-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-ink-100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-ink-100 rounded w-1/3" />
            </Card>
          ))}
        </div>
      )}

      {!displayLoading && !error && displayFields.length === 0 && (
        <div className="text-center py-16">
          <p className="text-ink-600 text-lg">
            {showFavs ? "No tienes campos favoritos" : "No hay campos disponibles"}
          </p>
          {showFavs && (
            <Button variant="outline" onClick={() => setShowFavs(false)} className="mt-4">
              Ver todos los campos
            </Button>
          )}
        </div>
      )}

      {!displayLoading && !error && displayFields.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayFields.map((field) => (
              <Card
                key={field.id}
                className="flex flex-col hover:shadow-md transition-shadow duration-200 cursor-pointer relative"
                onClick={() => navigate(`/fields/${field.id}`)}
              >
                {isAuthenticated && (
                  <HeartIcon
                    filled={isFavorite(field.id)}
                    onClick={() => handleToggleFav(field.id)}
                  />
                )}
                <div className="h-40 rounded-lg mb-4 overflow-hidden flex items-center justify-center bg-gradient-to-br from-pitch-100 to-pitch-200">
                  {field.imageUrl ? (
                    <img
                      src={`http://localhost:3000${field.imageUrl}`}
                      alt={field.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (e.target as HTMLImageElement).parentElement!.classList.add("flex");
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `
                          <svg class="w-12 h-12 text-pitch-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"/>
                          </svg>`;
                      }}
                    />
                  ) : (
                    <svg className="w-12 h-12 text-pitch-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"/>
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-ink mb-1">{field.name}</h3>
                <div className="flex-1" />
                <p className="text-sm text-ink-600 mb-1">
                  {field.sport} &middot; {field.location}
                </p>
                <p className="text-pitch font-bold text-lg mb-4">
                  {field.priceHour.toFixed(2)}€ / hora
                </p>
                <Button variant="primary" size="sm" className="w-full">
                  Ver detalles
                </Button>
              </Card>
            ))}
          </div>
          <Pagination page={displayPage} totalPages={displayTotalPages} onPageChange={showFavs ? goToFavPage : goToPage} />
        </>
      )}
    </div>
  );
};

export default Home;
