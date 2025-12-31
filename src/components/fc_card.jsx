import React from 'react';
import './FutPlayCard.css'; // We'll extract the CSS to a separate file

const FutPlayerCard = ({
  position = "RW",
  nation = "Zambia.jpg",
  club = "manchester_united.png",
  playerImage = "messi",
  name = "MESSI",
  pac = 0,
  sho = 0,
  pas = 0,
  dri = 0,
  def = 0,
  phy = 0,
  rating = (pac + sho + pas + dri + def + phy) / 6,
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
                  src={`/images/${nation}.png`} 
                  alt={nation.replace('.png', '')} 
                  draggable="false" 
                />
              </div>
              <div className="player-club">
                <img 
                  src={`/images/${club}.png`} 
                  alt={club.replace('.png', '')} 
                  draggable="false" 
                />
              </div>
            </div>
            <div className="player-picture">
              <img 
                src={`/images/${playerImage}.png`} 
                alt={playerImage.replace('.png', '')}  
                draggable="false" 
              />
              <div className="player-extra">
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
                    <div className="player-feature-title">HUN</div>
                  </span>
                  <span>
                    <div className="player-feature-value">{sho}</div>
                    <div className="player-feature-title">WIS</div>
                  </span>
                  <span>
                    <div className="player-feature-value">{pas}</div>
                    <div className="player-feature-title">DRI</div>
                  </span>
                </div>
                <div className="player-features-col">
                  <span>
                    <div className="player-feature-value">{dri}</div>
                    <div className="player-feature-title">FNY</div>
                  </span>
                  <span>
                    <div className="player-feature-value">{def}</div>
                    <div className="player-feature-title">DGN</div>
                  </span>
                  <span>
                    <div className="player-feature-value">{phy}</div>
                    <div className="player-feature-title">REL</div>
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