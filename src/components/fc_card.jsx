import React from 'react';
import './FutPlayCard.css'; // We'll extract the CSS to a separate file

const FutPlayerCard = ({
  rating = 97,
  position = "RW",
  nation = "argentina.svg",
  club = "barcelona.svg",
  playerImage = "messi.png",
  skills = 4,
  weakFoot = 4,
  name = "MESSI",
  pac = 97,
  sho = 95,
  pas = 94,
  dri = 99,
  def = 35,
  phy = 68
}) => {
  return (
    <>      
      <div className="wrapper">
        <div className="fut-player-card">
          {/* Player Card Top */}
          <div className="player-card-top">
            <div className="player-master-info">
              <div className="player-rating">
                <span>{rating}</span>
              </div>
              <div className="player-position">
                <span>{position}</span>
              </div>
              <div className="player-nation">
                <img 
                  src={`/images/${nation}`} 
                  alt={nation.replace('.svg', '')} 
                  draggable="false" 
                />
              </div>
              <div className="player-club">
                <img 
                  src={`/images/${club}`} 
                  alt={club.replace('.svg', '')} 
                  draggable="false" 
                />
              </div>
            </div>
            <div className="player-picture">
              <img 
                src={`/images/${playerImage}`} 
                alt={name} 
                draggable="false" 
              />
              <div className="player-extra">
                <span>{skills}*SM</span>
                <span>{weakFoot}*WF</span>
              </div>
            </div>
          </div>

          {/* Player Card Bottom */}
          <div className="player-card-bottom">
            <div className="player-info">
              {/* Player Name */}
              <div className="player-name">
                <span>{name}</span>
              </div>
              
              {/* Player Features */}
              <div className="player-features">
                <div className="player-features-col">
                  <span>
                    <div className="player-feature-value">{pac}</div>
                    <div className="player-feature-title">PAC</div>
                  </span>
                  <span>
                    <div className="player-feature-value">{sho}</div>
                    <div className="player-feature-title">SHO</div>
                  </span>
                  <span>
                    <div className="player-feature-value">{pas}</div>
                    <div className="player-feature-title">PAS</div>
                  </span>
                </div>
                <div className="player-features-col">
                  <span>
                    <div className="player-feature-value">{dri}</div>
                    <div className="player-feature-title">DRI</div>
                  </span>
                  <span>
                    <div className="player-feature-value">{def}</div>
                    <div className="player-feature-title">DEF</div>
                  </span>
                  <span>
                    <div className="player-feature-value">{phy}</div>
                    <div className="player-feature-title">PHY</div>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FutPlayerCard;