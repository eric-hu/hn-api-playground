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
  /** url is optional if text is provided */
  url?: string;
  /** text is optional if url is provided */
  text?: string;
}

/** currently unused, but comes back in API responses */
export interface Job {
  by: string;
  id: number;
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

const HNCommentThreadURL = (storyId: number) =>
  `https://news.ycombinator.com/item?id=${storyId}`;
const StoryComponent = ({ story, index }: { story: Story; index: number }) => {
  return (
      <li>
        <div>
        {/* <span>{index + 1}. </span> */}
      <a href={story.url}>{story.title}</a>
      </div>
        <div>
          {story.score} points.{" "}
          <a href={HNCommentThreadURL(story.id)}>
            {story.descendants} comments, {story.kids?.length} threads.
          </a>{" "}
          <a href={"https://news.ycombinator.com/user?id=" + story.by}>
            By {story.by}.
          </a>{" "}
          Time posted: {story.time}.
        </div>
      </li>
  );
};

const Foo = () => {
  const [result, setResult] = useState<Story[]>([]);
  useEffect(
    () => {
      fetchTopStoryIDs()
        .then((jsonResponse) => {
          window.jsonResponse = jsonResponse;
          return jsonResponse;
        })

        .then((topStoryIds: number[]) =>
          Promise.all(topStoryIds.slice(0, 30).map(fetchItem))
        )
        .then((topStories: Story[]) => {
          console.log(topStories);
          setResult(topStories);
        });
    },
    // Force useEffect to fire only once; prevents an infinite loop with useState
    []
  );

  return (
    <ol>
      {result.map((topStory, index) => (
        <StoryComponent story={topStory} key={index} index={index} />
      ))}
    </ol>
  );
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
