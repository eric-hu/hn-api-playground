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
      .then((topStoryIds: number[]) => {
        return fetchItem(topStoryIds[0]);
      })
      .then((topStory: unknown) => {
        console.log(topStory);
        setResult((JSON.stringify(topStory, null, 2)));
      });
  });

  return <pre>{result as any}</pre>;
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
