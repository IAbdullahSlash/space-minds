import './ReferenceScenesSection.css'

/**
 * ReferenceScenesSection - Displays similar reference scenes from BigEarthNet RAG
 * Shows metadata like country, season, climate zone, and similarity distance
 */
export default function ReferenceScenesSection({ scenes = [] }) {
  if (!scenes || scenes.length === 0) {
    return null
  }

  return (
    <div className="reference-scenes-section">
      <h3 className="reference-scenes-title">Similar Reference Scenes</h3>
      <p className="reference-scenes-subtitle">Top retrieved scenes from BigEarthNet</p>
      
      <div className="reference-scenes-list">
        {scenes.map((scene, idx) => (
          <div key={idx} className="reference-scene-card">
            {/* Scene Number & Similarity */}
            <div className="scene-header">
              <span className="scene-number">#{idx + 1}</span>
              {scene.distance !== undefined && (
                <span className="scene-distance">
                  {(scene.distance * 100).toFixed(1)}% similar
                </span>
              )}
            </div>

            {/* Metadata Grid */}
            <div className="scene-metadata-grid">
              {scene.metadata?.patch_id && (
                <div className="metadata-item">
                  <span className="metadata-label">Patch ID</span>
                  <span className="metadata-value" title={scene.metadata.patch_id}>
                    {scene.metadata.patch_id}
                  </span>
                </div>
              )}

              {scene.metadata?.country && (
                <div className="metadata-item">
                  <span className="metadata-label">Country</span>
                  <span className="metadata-value">{scene.metadata.country}</span>
                </div>
              )}

              {scene.metadata?.season && (
                <div className="metadata-item">
                  <span className="metadata-label">Season</span>
                  <span className="metadata-value">{scene.metadata.season}</span>
                </div>
              )}

              {scene.metadata?.climate_zone && (
                <div className="metadata-item">
                  <span className="metadata-label">Climate Zone</span>
                  <span className="metadata-value">{scene.metadata.climate_zone}</span>
                </div>
              )}
            </div>

            {/* Scene Text Preview */}
            {scene.text && (
              <div className="scene-text-preview">
                <p>{scene.text.substring(0, 200)}{scene.text.length > 200 ? '...' : ''}</p>
              </div>
            )}

            {/* Coordinates if available */}
            {scene.metadata?.latitude !== undefined && scene.metadata?.longitude !== undefined && (
              <div className="scene-coordinates">
                <span>
                  {scene.metadata.latitude.toFixed(4)}°, {scene.metadata.longitude.toFixed(4)}°
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
