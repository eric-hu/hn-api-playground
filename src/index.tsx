import { useEffect, useState, useReducer, StrictMode } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

declare global {
  interface Window {
    jsonResponse: unknown;
  }
}

type StoryID = number;

interface Story {
  by: string;
  descendants: number;
  id: StoryID;
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
  id: StoryID;
  score: number;
  time: number;
  title: string;
  type: "job";

  // This sometimes is empty from the API. It can be populated locally.
  // Hard-coding it in rendering further below for now.
  url: string;
}

const fetchItem = (id: number): Promise<Story> => {
  return fetch(
    `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
  ).then((response) => response.json());
};


/** Returns a promise that resolves the top 500 story ids, matching the HN
 * front page ordering (I think). Webpage paginates by 30 stories, so this is about 16-17 pages.*/
const fetchTopStoryIDs = (): Promise<StoryID[]> => {
  return fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty"
  ).then((response) => response.json());
};

const HNCommentThreadURL = (storyId: number) =>
  `https://news.ycombinator.com/item?id=${storyId}`;

const StoryLoading = () =>
  <li>
    <div>
      <a href=".">Loading ... </a>
    </div>
    <div>
      0 points.{" "}
      <a href=".">
        0 comments, 0 threads.
      </a>{" "}
      <a href=".">
        By ... .
      </a>{" "}
      Time posted: ... .<pre>=</pre>
    </div>
  </li>

const StoryComponent = ({ story }: { story: Story }) => {
  /** Compute the story time.
   * - HN API gives the time as UNIX Epoch, which is in seconds, UTC.
   * - Ecmascript epoch time is in milliseconds, UTC.
   */
  const postTime = new Date(story.time * 1000).toLocaleTimeString();

  if (story.type === "job")
    return (
      <li>
        <pre>
          +------------------------------------------------------------------+
        </pre>
        <div>
          <a href={"https://news.ycombinator.com/item?id=" + story.id}>{story.title}</a>
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

type Action = { index: number, type: 'update', value: Story } | { type: 'reset' }

const storiesInit = () => Array(30).fill(null)

function storiesReducer(state: Story[], action: Action): Story[] {
  switch (action.type) {
    case 'update':
      const stateClone = [...state]
      stateClone[action.index] = action.value
      return stateClone
    case 'reset':
      return storiesInit();
    default:
      throw new Error();
  }
}

const StoryList = () => {
  const [page, setPage] = useState<number>(1);
  const [storyIDs, setStoryIDs] = useState<number[]>(Array(30).fill(null));
  const [stories, storiesDispatch] = useReducer(storiesReducer, storiesInit());
  useEffect(
    () => {
      fetchTopStoryIDs().then((topStoryIds: StoryID[]) =>
        setStoryIDs(topStoryIds.slice((page - 1) * 30, page * 30))
      )
    },
    // Force useEffect to fire only once; prevents an infinite loop with useState
    [page]
  );

  useEffect(() => {
    storyIDs.forEach((storyID, index) => {
      if (storyID) {
        fetchItem(storyID).then((story: Story) => {
          storiesDispatch({ type: 'update', index: index, value: story })
        })
      }
    })
  },
    [storyIDs]
  )


  // This runs more often than it needs to, but it can be optimized later
  const sortedStoryPoints = [...stories].sort((a, b) => {
    if (a?.score === b?.score) return 0;
    if (a?.score < b?.score) return -1;
    return 1;
  })

  const storiesMaxVotes = sortedStoryPoints[29]?.score
  const storiesMinVotes = sortedStoryPoints[0]?.score
  const storiesMedianVotes = (sortedStoryPoints[14]?.score + sortedStoryPoints[15]?.score) / 2
  const storiesAverageVotes = sortedStoryPoints.reduce<number>((accum, story) => accum + story?.score, 0) / 30

  return (
    <>
      <ol start={(page - 1) * 30 + 1}>
        {stories.map((story, index) => (
          story ?
            <StoryComponent story={story} key={index + story.title} />
            :
            <StoryLoading key={index + "loading"} />
        ))}
      </ol>
      {page === 1 ? (
        <button
          onClick={() => {
            setPage(2);
            storiesDispatch({ type: 'reset' });
          }}
        >
          Page 2
        </button>
      ) : (
        <button
          onClick={() => {
            setPage(1);
            storiesDispatch({ type: 'reset' });
          }}
        >
          Page 1
        </button>
      )}
      <div>
        <h3>Stats for this page:</h3>
        <div>Max votes: {storiesMaxVotes}</div>
        <div>Min votes: {storiesMinVotes}</div>
        <div>Median votes: {storiesMedianVotes}</div>
        <div>Average votes: {storiesAverageVotes}</div>
      </div>
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
