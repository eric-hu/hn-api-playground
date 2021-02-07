import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

declare global {
  interface Window {
    jsonResponse: unknown;
  }
}

interface Story {
  by: string;
  descendants: number;
  id: number;
  /** The number of child comments. Count may not match what's visible on
   * website. Includes at least deleted comments. */
  kids: number[];
  score: number;
  time: number;
  title: string;
  type: string;
  url: string;
}

const fetchItem = (id: number): Promise<Story> => {
  return fetch(
    `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
  ).then((response) => response.json());
};

/** Returns a promise that resolves the top 500 story ids, matching the HN
 * front page ordering (I think). Webpage paginates by 30 stories, so this is about 16-17 pages.*/
const fetchTopStoryIDs = (): Promise<number[]> => {
  return fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty"
  ).then((response) => response.json());
};

const Foo = () => {
  const [result, setResult] = useState<unknown>();
  useEffect(() => {
    fetchTopStoryIDs()
      .then((jsonResponse) => {
        window.jsonResponse = jsonResponse;
        return jsonResponse;
      })
      /** Show just one story */
      // .then((topStoryIds: number[]) => fetchItem(topStoryIds[0]))
      // .then((topStory: unknown) => {
      //   // @ts-ignore
      //   topStory.url = `<a href=${topStory.url}>${topStory.url}</a>`;
      //   setResult(
      //     JSON.stringify(
      //       topStory,
      //       ["by", "id", "score", "title", "url", "descendants", "time"],
      //       2
      //     )
      //   );

      /** Show top N stories */
      .then((topStoryIds: number[]) =>
        Promise.all(topStoryIds.slice(0, 30).map(fetchItem))
      )
      .then((topStories: unknown) => {
        // @ts-ignore
        topStories = topStories.map((topStory) => ({
          ...topStory,
          url: `<a href=${topStory.url}>${topStory.url}</a>`,
        }));
        setResult(
          JSON.stringify(
            topStories,
            ["by", "id", "score", "title", "url", "descendants", "time"],
            2
          )
        );
      });
  });

  // return <pre>{result as any}</pre>;
  /** React will sanitize HTML unless it's called using dangerouslySetInnerHTML */
  return React.createElement("pre", {
    dangerouslySetInnerHTML: { __html: result as any },
  });
};

ReactDOM.render(
  <React.StrictMode>
    <Foo />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
