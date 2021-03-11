import { useEffect, useState, StrictMode } from "react";
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
  type: "story" | unknown;
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
  type: "job";
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

const StoryComponent = ({ storyID }: { storyID: number }) => {
  const [story, setStory] = useState<Story>({
    url: undefined,
    title: "loading",
    score: 0,
    id: 0,
    descendants: 0,
    by: "loading",
    kids: [],
    time: 0,
    type: "story",
  });

  useEffect(() => {
    if (storyID !== null) {
      fetchItem(storyID).then((story: Story) => setStory(story));
    } else {
      setStory({
        url: undefined,
        title: "loading",
        score: 0,
        id: 0,
        descendants: 0,
        by: "loading",
        kids: [],
        time: 0,
        type: "story",
      });
    }
  }, [storyID]);

  /** Compute the story time.
   * - HN API gives the time as UNIX Epoch, which is in seconds, UTC.
   * - Ecmascript epoch time is in milliseconds, UTC.
   */
  const postTime = new Date(story.time * 1000).toLocaleTimeString();

  console.log(story.type);
  if (story.type === "job")
    return (
      <li>
        <pre>
          +------------------------------------------------------------------+
        </pre>
        <div>
          <a href={story.url}>{story.title}</a>
        </div>
        <div>
          <a href={"https://news.ycombinator.com/user?id=" + story.by}>
            By {story.by}.
          </a>{" "}
          Time posted: {postTime}.
          <pre>
            +------------------------------------------------------------------+
          </pre>
        </div>
      </li>
    );

  /** Transform the story points so higher scoring stories are visually
   * distinct. Try to use up all the available horizontal space (on mobile).
   * Ensure that normalization is at least 1 so the empty state renders with
   * height.
   *
   * Logarithm based normalization made all scores look too low. Perhaps that
   * would be useful for a pretentious algorithm, AKA most stuff isn't worth
   * reading. */
  const pointNormalization = Math.floor(Math.sqrt(story.score)) + 1;
  const pointBar = new Array(pointNormalization).fill("=>").join("");

  return (
    <li>
      <div>
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
        Time posted: {postTime}.<pre>{pointBar}</pre>
      </div>
    </li>
  );
};

const StoryList = () => {
  const [page, setPage] = useState<number>(1);
  const [result, setResult] = useState<number[]>(Array(30).fill(null));
  useEffect(
    () => {
      fetchTopStoryIDs().then((topStoryIds: number[]) =>
        setResult(topStoryIds.slice((page - 1) * 30 + 1, page * 30))
      );
    },
    // Force useEffect to fire only once; prevents an infinite loop with useState
    [page]
  );

  return (
    <>
      <ol start={(page - 1) * 30 + 1}>
        {result.map((topStoryID, index) => (
          <StoryComponent storyID={topStoryID} key={index} />
        ))}
      </ol>
      {page === 1 ? (
        <button
          onClick={() => {
            setPage(2);
            setResult(Array(30).fill(null));
          }}
        >
          Page 2
        </button>
      ) : (
        <button
          onClick={() => {
            setPage(1);
            setResult(Array(30).fill(null));
          }}
        >
          Page 1
        </button>
      )}
    </>
  );
};

ReactDOM.render(
  <StrictMode>
    <StoryList />
  </StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
