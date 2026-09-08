const conversations = [
  ["AM", "Awa Mensah", "Le document est prêt pour validation", "09:42"],
  ["ÉP", "Équipe produit", "Fatou : je vérifie le besoin", "Hier"],
  ["DK", "David Koffi", "Message vocal · 0:34", "Lun."],
];

export default function Home() {
  return <main className="shell">
    <aside className="sidebar">
      <header><div><span className="eyebrow">ESPACE KLADRIVA</span><h1>Kladrichat</h1></div><button aria-label="Nouvelle conversation">＋</button></header>
      <label className="search"><span>⌕</span><input aria-label="Rechercher" placeholder="Rechercher une conversation" /></label>
      <nav aria-label="Conversations">{conversations.map(([initials, name, preview, time], index) => <a className={index === 0 ? "active" : ""} href="#conversation" key={name}><span className="avatar">{initials}</span><span className="summary"><strong>{name}</strong><small>{preview}</small></span><time>{time}</time></a>)}</nav>
      <footer><span className="avatar me">NK</span><span><strong>Nadia K.</strong><small>Disponible</small></span><button aria-label="Réglages">⚙</button></footer>
    </aside>
    <section className="conversation" id="conversation">
      <header><span className="avatar">AM</span><div><strong>Awa Mensah</strong><small><i /> En ligne</small></div><div className="actions"><button aria-label="Appel audio">⌕</button><button aria-label="Informations">ⓘ</button></div></header>
      <div className="network">✓ Connecté · messages synchronisés</div>
      <div className="messages"><p className="date">AUJOURD’HUI</p><article><p>Bonjour Nadia, peux-tu confirmer les priorités de cette semaine&nbsp;?</p><time>09:34</time></article><article className="mine"><p>Oui. La validation du parcours d’invitation passe en premier. Je t’envoie le détail.</p><time>09:36 ✓✓</time></article><article><p>Parfait, le document est prêt pour validation.</p><time>09:42</time></article></div>
      <form className="composer"><button type="button" aria-label="Joindre un fichier">＋</button><input aria-label="Message" placeholder="Écrire un message" /><button type="submit" aria-label="Envoyer">➤</button></form>
    </section>
  </main>;
}
