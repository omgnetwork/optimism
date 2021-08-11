import React, { Component } from "react";

class NavBar extends Component {
  navSlide = () => {
    const burger = document.getElementById("burger");
    const nav = document.getElementById("nav-links");
    let navLinks = document.getElementsByClassName("nav-link");
    burger.addEventListener("click", () => {
      nav.classList.toggle("nav-active");
      Array.prototype.forEach.call(navLinks, function (link, index) {
        if (link.style.animation) {
          link.style.animation = "";
        } else {
          link.style.animation = `navLinkFade 0.5s ease forwards ${
            index / 7 + 0.5
          }s`;
        }
      });
      burger.classList.toggle("toggle");
    });
  };

  componentDidMount = () => {
    this.navSlide();
    window.addEventListener("scroll", function () {
      var nav = document.querySelector("nav");
      nav.classList.toggle("sticky", window.scrollY > 0);
    });
  };
  render() {
    return (
      <div className="nav">
        <nav>
          <div class="logo">
            <a href="index.html">
              <img src="img/enya.png" alt="enya logo" />
            </a>
          </div>
          <ul class="nav-links" id="nav-links">
            <li>
              <a href="#company">Company</a>
            </li>
            <li>
              <a href="#developers">Developers</a>
            </li>
            <li>
              <a href="#contact">Contact Us</a>
            </li>
          </ul>
          <div className="burger" id="burger">
            <div className="line1"></div>
            <div className="line2"></div>
            <div className="line3"></div>
          </div>
        </nav>
      </div>
    );
  }
}

export default NavBar;
