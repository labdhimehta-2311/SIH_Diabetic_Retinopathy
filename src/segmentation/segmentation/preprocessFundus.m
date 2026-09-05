function enhanced = preprocessFundus(img)

% Extract green channel
if size(img,3) == 3
    green = img(:,:,2);
else
    green = img;
end

% Improve contrast
enhanced = adapthisteq(green);

end