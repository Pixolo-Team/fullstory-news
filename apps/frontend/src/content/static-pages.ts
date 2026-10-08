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
  about: {
    slug: 'about',
    title: 'About',
    intro:
      'Full Story is a daily news site for people who want to know what happened without reading a newspaper to find out.',
    contentHtml: `
      <h2>What we cover</h2>
      <p>Four sections - Politics, Tech, Sports and World - and a small number of Stories in each, most days. We would rather publish four Stories worth finishing than forty nobody reads to the end.</p>
      <h2>How we write</h2>
      <p>Plain language, short paragraphs, no jargon and no house style that assumes you already follow the subject. A reader coming to a story cold should reach the end understanding it.</p>
      <p>Every Story says when it was published and who it is by. Where a Story builds on reporting by another publication, that publication is named and linked.</p>
      <h2>Independence</h2>
      <p>No paid placement. No sponsored Story presented as reporting. Where advertising appears, it is marked as advertising.</p>
      <h2>Corrections</h2>
      <p>Corrections are appended to the Story they correct, dated, and never applied silently. See the <a href="/editorial-policy">Editorial Policy</a> for how we handle accuracy, and the <a href="/grievance">Grievance</a> page to raise one.</p>
      <h2>Who publishes Full Story</h2>
      <p>Oliver Pichler<br />15 S Broad St, Hillsdale, MI 49242, USA<br />oliver.pichler09@gmail.com</p>
      <p>Reach us through the <a href="/contact">Contact</a> page.</p>
    `,
  },

  contact: {
    slug: 'contact',
    title: 'Contact',
    intro: 'Who to write to, and where each kind of message goes.',
    contentHtml: `
      <h2>General enquiries</h2>
      <p>oliver.pichler09@gmail.com</p>
      <p>Questions about the site, the Stories or the people behind them.</p>
      <h2>Corrections and complaints</h2>
      <p>Anything factual you believe we have got wrong goes to the officer named on the <a href="/grievance">Grievance</a> page, which also sets out what to include and how long a reply takes.</p>
      <h2>Permissions and republication</h2>
      <p>Republishing a Story requires written permission, and the byline travels with the text. Write to the address above with the Story title and where you intend to publish it. The <a href="/terms">Terms &amp; Conditions</a> cover quoting and linking, neither of which needs permission.</p>
      <h2>Postal address</h2>
      <p>Full Story<br />15 S Broad St<br />Hillsdale, MI 49242<br />USA</p>
      <h2>Response times</h2>
      <p>Receipt is acknowledged within forty-eight hours. A substantive response follows within fifteen working days.</p>
    `,
  },

  'editorial-policy': {
    slug: 'editorial-policy',
    title: 'Editorial Policy',
    intro: 'How Stories are made, where the facts come from, and what happens when we get one wrong.',
    contentHtml: `
      <h2>Where Stories come from</h2>
      <p>Full Story reports on events already on the public record. Where a Story draws on reporting first published elsewhere, the originating publication is named in the Story and linked from it. We summarise and explain that reporting; we do not reproduce it.</p>
      <h2>Accuracy</h2>
      <p>Facts in a Story come from its sources, not from inference. Where something is disputed, the Story says so rather than picking a side by omission.</p>
      <p>Direct quotations are reproduced exactly as the source published them. We do not invent, paraphrase or edit words inside quotation marks, and we do not attribute speech to anyone who did not say it.</p>
      <h2>Use of automated tools</h2>
      <p>Full Story uses automated tools to help draft Stories from source material. The facts and quotations in a Story come from the reporting it cites, not from a model, and the checks described above apply to every Story regardless of how it was drafted.</p>
      <h2>Corrections</h2>
      <p>A correction is appended to the Story it corrects, carries the date it was made, and is never applied silently. Where an error is serious enough to change what a Story means, the correction says so in plain terms.</p>
      <p>To request one, write to the officer named on the <a href="/grievance">Grievance</a> page.</p>
      <h2>Independence</h2>
      <p>No advertiser, sponsor or commercial partner sees a Story before publication or influences whether it runs. Advertising, where it appears, is marked as advertising and kept visually distinct from reporting.</p>
      <h2>Bylines and dates</h2>
      <p>Every Story carries a byline and a publication date. Where a Story is substantively updated after publication, the update date is shown alongside the original.</p>
    `,
  },

  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    intro:
      'Fullstory is readable without an account, and this page describes exactly what that means for your data.',
    contentHtml: `
      <h2>What we collect</h2>
      <p>Fullstory records the Stories you open and the search terms you enter, without an account and without an advertising identifier. Requests are aggregated daily; individual request logs are discarded after thirty days.</p>
      <h2>What we do not do</h2>
      <p>No reader accounts, and therefore no reader profiles.</p>
      <p>No third-party advertising or behavioural tracking scripts.</p>
      <p>No sale or transfer of reader data to any other party.</p>
      <h2>Contact</h2>
      <p>Write to the officer named on the Grievance page. A response is due within fifteen working days of receipt.</p>
    `,
  },

  terms: {
    slug: 'terms',
    title: 'Terms & Conditions',
    intro: 'The terms below govern reading, quoting and republishing Fullstory.',
    contentHtml: `
      <h2>Use of the site</h2>
      <p>Read, quote and link freely. Republication of a Fullstory requires written permission, and the byline travels with the text in every case.</p>
      <h2>Corrections</h2>
      <p>A correction is appended to the Story it corrects, dated, and never applied silently. Requests go to the officer named on the Grievance page.</p>
      <h2>Liability</h2>
      <p>Stories are accurate as published; later developments are carried as new Stories.</p>
      <p>External links are not endorsements, and their content is not ours.</p>
      <p>Embedded third-party posts remain the property of their authors.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the law of the jurisdiction in which Fullstory is registered. Disputes are heard there.</p>
    `,
  },

  grievance: {
    slug: 'grievance',
    title: 'Grievance',
    intro:
      'If a Story is inaccurate, or something on this site has caused you harm, this page tells you who to write to and what happens next.',
    contentHtml: `
      <h2>Grievance Officer</h2>
      <p>oliver.pichler09@gmail.com<br />Oliver Pichler<br />15 S Broad St, Hillsdale, MI 49242, USA</p>
      <h2>What to include</h2>
      <p>The Story title and the date you read it.</p>
      <p>The passage you are disputing, quoted exactly.</p>
      <p>What you believe the accurate position to be.</p>
      <h2>What happens next</h2>
      <p>Receipt is acknowledged within forty-eight hours. A substantive response follows within fifteen working days. Where a correction is warranted it is appended to the Story, dated, and never applied silently.</p>
    `,
  },
};
