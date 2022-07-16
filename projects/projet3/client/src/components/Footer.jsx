function Link({ uri, text }) {
  return <a href={uri} target="_blank" rel="noreferrer">{text}</a>;
}

function Footer() {
  return (
    <footer>
      <h2>Liens Utiles</h2>
      <Link uri={"https://github.com/eden91940/alyra/tree/main/projects/projet3"} text={"GitHub"} />
    </footer >
  );
}

export default Footer;
