/**
 * Static page copy.
 *
 * Deliberately not in the database - see docs/decisions.md #5. Updating this
 * text is a code change and a deploy, which suits copy the client supplies
 * once and rarely revises.
 */
export interface StaticPageData {
  slug: string;
  title: string;
  intro: string;
  contentHtml: string;
}

export const STATIC_PAGES: Record<string, StaticPageData> = {
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    intro:
      'Full Story is readable without an account, and this page describes exactly what that means for your data.',
    contentHtml: `
      <h2>What we collect</h2>
      <p>Full Story records the Stories you open and the search terms you enter, without an account and without an advertising identifier. Requests are aggregated daily; individual request logs are discarded after thirty days.</p>
      <h2>What we do not do</h2>
      <ul>
        <li>No reader accounts, and therefore no reader profiles.</li>
        <li>No third-party advertising or behavioural tracking scripts.</li>
        <li>No sale or transfer of reader data to any other party.</li>
      </ul>
      <h2>Contact</h2>
      <p>Write to the officer named on the Grievance page. A response is due within fifteen working days of receipt.</p>
    `,
  },

  terms: {
    slug: 'terms',
    title: 'Terms & Conditions',
    intro: 'The terms below govern reading, quoting and republishing Full Story.',
    contentHtml: `
      <h2>Use of the site</h2>
      <p>Read, quote and link freely. Republication of a full Story requires written permission, and the byline travels with the text in every case.</p>
      <h2>Corrections</h2>
      <p>A correction is appended to the Story it corrects, dated, and never applied silently. Requests go to the officer named on the Grievance page.</p>
      <h2>Liability</h2>
      <ul>
        <li>Stories are accurate as published; later developments are carried as new Stories.</li>
        <li>External links are not endorsements, and their content is not ours.</li>
        <li>Embedded third-party posts remain the property of their authors.</li>
      </ul>
      <h2>Governing law</h2>
      <p>These terms are governed by the law of the jurisdiction in which Full Story is registered. Disputes are heard there.</p>
    `,
  },

  grievance: {
    slug: 'grievance',
    title: 'Grievance',
    intro:
      'If a Story is inaccurate, or something on this site has caused you harm, this page tells you who to write to and what happens next.',
    contentHtml: `
      <h2>Grievance Officer</h2>
      <p>[OFFICER NAME]<br />[EMAIL ADDRESS]<br />[POSTAL ADDRESS]</p>
      <h2>What to include</h2>
      <ul>
        <li>The Story title and the date you read it.</li>
        <li>The passage you are disputing, quoted exactly.</li>
        <li>What you believe the accurate position to be.</li>
      </ul>
      <h2>What happens next</h2>
      <p>Receipt is acknowledged within forty-eight hours. A substantive response follows within fifteen working days. Where a correction is warranted it is appended to the Story, dated, and never applied silently.</p>
    `,
  },
};
