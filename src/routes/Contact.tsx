export default function Contact() {
  return (
    <section className="view is-active" id="contact" aria-label="Contact">
      <div className="view-inner">
        <p className="crumb">~/reese/contact</p>
        <h1 className="view-title">Get in touch</h1>
        <p className="view-lead">
          <span className="spark">✳</span> Open to opportunities — let's build something.
        </p>
        <ul className="contact-list">
          <li>
            <span className="ck">email</span>{' '}
            <a href="mailto:reesefergie@gmail.com">reesefergie@gmail.com</a>
          </li>
          <li>
            <span className="ck">linkedin</span>{' '}
            <a href="[TODO: LinkedIn URL]" target="_blank" rel="noopener">
              [TODO: /in/your-handle]
            </a>
          </li>
          <li>
            <span className="ck">résumé</span>{' '}
            <a href="resume.pdf" target="_blank" rel="noopener">
              resume.pdf
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
