// Apercu fidele d'un embed Discord, tel qu'il apparaitra reellement dans le salon.
// Reproduit la mise en page native: barre de couleur a gauche, auteur, titre (lien),
// description, champs en grille 2 colonnes pour les "inline", image, miniature, footer.

function EmbedPreview({ embed, content }) {
  const hasAuthor = !!embed.authorName;
  const hasFooter = !!embed.footerText || embed.useTimestamp;
  const fields = (embed.fields || []).filter((f) => f.name || f.value);

  return (
    <div className="bg-[#313338] rounded-lg p-4 font-[Inter,sans-serif] text-sm max-w-[520px]">
      {content && <p className="text-[#dbdee1] mb-2 whitespace-pre-wrap break-words">{content}</p>}

      <div className="flex rounded overflow-hidden" style={{ background: "#2b2d31" }}>
        <div className="w-1 shrink-0" style={{ background: embed.color || "#9B6FBF" }} />
        <div className="p-4 flex-1 min-w-0">
          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              {hasAuthor && (
                <div className="flex items-center gap-2 mb-2">
                  {embed.authorIconUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={embed.authorIconUrl} alt="" className="w-6 h-6 rounded-full object-cover" onError={(e) => (e.target.style.display = "none")} />
                  )}
                  <span className="text-white font-semibold text-sm">{embed.authorName}</span>
                </div>
              )}

              {embed.title && (
                <div className="text-white font-semibold mb-1 break-words">
                  {embed.titleUrl ? (
                    <a href={embed.titleUrl} target="_blank" rel="noreferrer" className="text-[#00a8fc] hover:underline">
                      {embed.title}
                    </a>
                  ) : (
                    embed.title
                  )}
                </div>
              )}

              {embed.description && <p className="text-[#dbdee1] whitespace-pre-wrap break-words mb-2">{embed.description}</p>}

              {fields.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                  {fields.map((f, i) => (
                    <div key={i} className={f.inline ? "col-span-1" : "col-span-2"}>
                      <div className="text-white font-semibold text-xs mb-0.5 break-words">{f.name || "\u00A0"}</div>
                      <div className="text-[#dbdee1] text-xs whitespace-pre-wrap break-words">{f.value || "\u00A0"}</div>
                    </div>
                  ))}
                </div>
              )}

              {embed.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={embed.imageUrl}
                  alt=""
                  className="mt-3 rounded max-w-full max-h-[300px] object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}

              {hasFooter && (
                <div className="flex items-center gap-2 mt-3 text-[#949ba4] text-xs">
                  {embed.footerIconUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={embed.footerIconUrl} alt="" className="w-5 h-5 rounded-full object-cover" onError={(e) => (e.target.style.display = "none")} />
                  )}
                  <span>
                    {embed.footerText}
                    {embed.footerText && embed.useTimestamp ? " • " : ""}
                    {embed.useTimestamp && new Date().toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              )}
            </div>

            {embed.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={embed.thumbnailUrl}
                alt=""
                className="w-20 h-20 rounded object-cover shrink-0"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

module.exports = EmbedPreview;
