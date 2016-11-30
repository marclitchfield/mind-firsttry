import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { match, RouterContext } from "react-router";
import Root from "../app/components/root";
import IdeasRepo from "../data/ideas";
import routes from "../app/routes";

const router = express.Router();
const repo = new IdeasRepo();

const RootFactory = React.createFactory(Root);

router.get("*", (request, response, next) => {
  match({ routes, location: request.url }, (error, redirectLocation, renderProps) => {
    if (error) { 
      return response.status(500).send(error.message); 
    }
    if (redirectLocation) {
      return response.redirect(302, redirectLocation.pathname + redirectLocation.search);
    }
    if (renderProps) {
      return renderRoute(response, next, renderProps);
    }
    response.status(404).send("Not found");
  });
});

function getPropsFromRoute({routes}, componentProps) {
  let props = {};
  const lastRoute = routes[routes.length - 1];
  routes.reduceRight((prevRoute, currRoute) => {
    componentProps.forEach(componentProp => {
      if (!props[componentProp] && currRoute.component[componentProp]) {
        props[componentProp] = currRoute.component[componentProp];
      }
    });
  }, lastRoute);
  return props;
}

function renderRoute(response, next, renderProps) {
  const title = "Mind: Ideas";
  const routeProps = getPropsFromRoute(renderProps, ['requestInitialData']);
  if (routeProps.requestInitialData) {
    routeProps.requestInitialData().then((data) => {
      const handleCreateElement = (Component, props) => (<Component initialData={data} {...props} />);
      const markup = renderToString(<RouterContext createElement={handleCreateElement} {...renderProps} />);

      response.render("index", {
        title: title,
        initialData: JSON.stringify(data),
        markup: markup
      });
    }).catch((err) => next(err));
  } else {
    response.render("index", {
      title: title,
      initialData: null,
      markup: renderToString(<RouterContext {...renderProps} />)
    });
  }
}

module.exports = router;
